import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import fs from "fs/promises"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.exec(`kubectl create namespace crowdsec || true;`)

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      secrets: [],
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  sh.exec(
    `helm repo add crowdsec https://crowdsecurity.github.io/helm-charts; helm repo update;`,
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

  sh.exec(
    `helm install crowdsec crowdsec/crowdsec -f .secrets/crowdsec.values.yml -n crowdsec;`,
  )
}

export default run
