import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const docker = await createClient(configurationApi)
  docker.build(`${name}:latest`)
  docker.push(`${name}:latest`)
}

export default run
