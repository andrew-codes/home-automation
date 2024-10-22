import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const docker = await createClient(configurationApi)
  await docker.build(`coder:latest`)
  await docker.pushImage(`coder:latest`)
}

export default run
