import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", "cloudflared")
}

export default run
