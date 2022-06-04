import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name, image } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port_external = await configurationApi.get(
    "alexa-shopping-list-updater-skill/port/external",
  )
  const secrets: Array<keyof Configuration> = ["mqtt/password", "mqtt/username"]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image,
      name,
      secrets: JSON.stringify(secrets),
      port: parseInt(port_external),
    },
  )
  const resourceJson = JSON.parse(resources)
  Object.values(resourceJson).forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
