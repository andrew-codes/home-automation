import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker-registry/hostname")
  const port = await configurationApi.get("graph-subscriptions/port/external")
  const secrets: Array<keyof Configuration> = ["mqtt/password", "mqtt/username"]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry.value}/${name}:latest`,
      name,
      port: port.value,
      secrets,
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