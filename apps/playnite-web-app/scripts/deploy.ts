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
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `ghcr.io/andrew-codes/playnite-web-app:dev`,
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
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", name)
}

export default run
