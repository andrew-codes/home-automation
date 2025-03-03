import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker-registry/hostname")
  const secrets: Array<keyof Configuration> = ["mqtt/username", "mqtt/password"]
  const port = await configurationApi.get("playnite-web/port/external")
  const username = await configurationApi.get("playnite-web/username")
  const password = await configurationApi.get("playnite-web/password")
  const secret = await configurationApi.get("playnite-web/secret")
  const nfsIp = await configurationApi.get("nfs/ip")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      host: "games.smith-simms.family",
      image: `ghcr.io/andrew-codes/playnite-web-app:11-latest`,
      name,
      port: parseInt(port.value),
      registryHostname: registry.value,
      secrets,
      username: username.value,
      password: password.value,
      secret: secret.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kube.rolloutDeployment("restart", name)

  const stagingPort = await configurationApi.get(
    "playnite-web/staging/port/external",
  )
  const stagingResources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      host: "games-staging.smith-simms.family",
      image: `ghcr.io/andrew-codes/playnite-web-app:dev`,
      name: `${name}-staging`,
      port: parseInt(stagingPort.value),
      registryHostname: registry.value,
      secrets,
      username: username.value,
      password: password.value,
      secret: secret.value,
    },
  )
  const stagingResourceJson = JSON.parse(stagingResources)
  await Promise.all(
    stagingResourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kube.rolloutDeployment("restart", `${name}-staging`)
}

export default run
