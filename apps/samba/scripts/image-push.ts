import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const docker = await createClient(configurationApi)
  await docker.build(`samba:latest`)
  await docker.pushImage(`samba:latest`)
}

export default run
