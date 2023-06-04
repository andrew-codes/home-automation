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
  const port_external = await configurationApi.get("zwavejs/port/external")
  const wsPort = await configurationApi.get("zwavejs/port/external/web-socket")
  const secrets: Array<keyof Configuration> = []
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `zwavejs/zwavejs2mqtt:8.18.0`,
      name,
      secrets,
      port: parseInt(port_external.value),
      registryHostname: registry.value,
      wsPort: parseInt(wsPort.value),
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
