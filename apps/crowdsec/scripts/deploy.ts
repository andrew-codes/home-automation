import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import fs from "fs/promises"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const dashboardPort = await configurationApi.get("crowdsec/port/external")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      secrets: [],
      crowdsecDashboardPort: dashboardPort.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  throwIfError(
    sh.exec(
      `helm repo add crowdsec https://crowdsecurity.github.io/helm-charts; helm repo update;`,
    ),
  )

  const elasticUsername = await configurationApi.get(
    "crowdsec/elastic/username",
  )
  const elasticPassword = await configurationApi.get(
    "crowdsec/elastic/password",
  )
  const authorizationToken = Buffer.from(
    `${elasticUsername.value}:${elasticPassword.value}`,
    "ascii",
  ).toString("base64")

  const k8sIp = await configurationApi.get("k8s/main-node/ip")
  const elasticPort = await configurationApi.get(
    "elk-stack/elastic-search/port/external",
  )

  const httpConfig = sh
    .exec(
      `yq '.config.notifications."http.yaml"' < src/crowdsec.values.yml | yq '.headers.Authorization = "Basic ${authorizationToken}"' | yq '.url = "http://${k8sIp.value}:${elasticPort.value}/_bulk"`,
      { silent: true },
    )
    .toString()

  const values = sh
    .exec(
      `yq '.config.notifications."http.yaml" = "'"${httpConfig}"'"' < src/crowdsec.values.yml`,
      { silent: true },
    )
    .toString()

  await fs.mkdir(".secrets", { recursive: true })
  await fs.writeFile(".secrets/crowdsec.values.yml", values)

  const installationOutput = await throwIfError(
    sh.exec(
      `helm uninstall crowdsec || true; helm install crowdsec crowdsec/crowdsec -f .secrets/crowdsec.values.yml --namespace default || true;`,
      { silent: true },
    ),
  )
  const username = installationOutput.match(/login : (.*)/)?.[1]
  const password = installationOutput.match(/password : (.*)/)?.[1]

  if (!!username && !!password) {
    await configurationApi.set("crowdsec/username", username)
    await configurationApi.set("crowdsec/password", password)
  }

  await throwIfError(
    sh.exec(
      `kubectl patch deployment crowdsec-lapi --namespace default --type='json' --patch='[{"op": "remove", "path": "/spec/template/spec/containers/0/volumeMounts/0"},{"op": "remove", "path": "/spec/template/spec/containers/1/volumeMounts/1"},{"op": "remove", "path": "/spec/template/spec/volumes/1"}]'`,
    ),
  )

  const patches = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "patch.jsonnet"),
    {
      secrets: [],
    },
  )
  const patchesJson = JSON.parse(patches)
  await Promise.all(
    patchesJson.map(([name, resourceType, namespace, resource]) => {
      return kubectl.patch(
        name,
        resourceType,
        namespace,
        JSON.stringify(resource),
      )
    }),
  )
}

export default run
