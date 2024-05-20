import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const docker = await createClient(configurationApi)
  await docker.build(`influxdb:latest`)
  await docker.pushImage(`influxdb:latest`)
}

export default run
