import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const name = "graph"
  const docker = await createClient(configurationApi)
  await docker.build(`${name}:latest`)
  await docker.pushImage(`${name}:latest`)
}

export default run
