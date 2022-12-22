import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
  )
  const resourceJson = JSON.parse(resources)
  try {
    await Promise.all(
      resourceJson.map((resource) =>
        kubectl.applyToCluster(JSON.stringify(resource)),
      ),
    )
  } catch (error) {
    console.log(error)
  }
}

export default run
