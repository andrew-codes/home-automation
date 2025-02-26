import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  logger.info("Deploying Tailscale")
  const ip = (await configurationApi.get("tailscale/ip")).value
  const hostname = (await configurationApi.get("tailscale/hostname")).value
  const authKey = (await configurationApi.get("tailscale/auth-key")).value

  const deploymentPath = path.join(__dirname, "..", "src", "deployment")
  await runPlaybook(path.join(deploymentPath, "index.yml"), [ip], {
    hostname,
    subnetRoutes: [].join(","),
    authKey,
  })
}

export default run
