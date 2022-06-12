import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port_external = await configurationApi.get("facebox/port/external")
  const mbKey = await configurationApi.get("facebox/mb-key")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `machinebox/facebox:latest`,
      name,
      mbKey,
      secrets: [],
      port: port_external,
    },
  )
  const resourceJson = JSON.parse(resources)
  resourceJson.forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
