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
  const nfsUsername = await configurationApi.get("nfs/username")
  const nfsPassword = await configurationApi.get("nfs/password")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      host: "games.smith-simms.family",
      image: `ghcr.io/andrew-codes/playnite-web-app:7-latest`,
      name,
      nfsPassword: nfsPassword.value,
      nfsUsername: nfsUsername.value,
      nfsIp: nfsIp.value,
      port: parseInt(port.value),
      registryHostname: registry.value,
      secrets,
      username: username.value,
      password: password.value,
      secret: secret.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", name)

  const stagingPort = await configurationApi.get(
    "playnite-web/staging/port/external",
  )
  const stagingResources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      host: "games-staging.smith-simms.family",
      image: `ghcr.io/andrew-codes/playnite-web-app:dev`,
      name: `${name}-staging`,
      nfsPassword: nfsPassword.value,
      nfsUsername: nfsUsername.value,
      nfsIp: nfsIp.value,
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
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", `${name}-staging`)
}

export default run
