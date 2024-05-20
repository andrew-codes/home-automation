import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const certs = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "certs.yml"),
    {},
  )
  await kubectl.applyToCluster(certs)
  await kubectl.rolloutDeployment("restart", "cloudflared")
}

export default run
