import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const alexa_shopping_list_updater_skill_port_external =
    await configurationApi.get("alexa-shopping-list-updater/port/external")
  const name = "alexa-shopping-list-updater-skill"

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      name,
      alexa_shopping_list_updater_skill_port_external: parseInt(
        alexa_shopping_list_updater_skill_port_external,
      ),
    },
  )
  const resourceJson = JSON.parse(resources)
  Object.values(resourceJson).forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
