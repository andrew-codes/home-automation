import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"
import path from "path"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const docker = await createClient(configurationApi)
  await docker.build(`${name}:latest`, {
    dockerFile: path.join(__dirname, "..", "src", "Dockerfile"),
    context: path.join(__dirname, "..", "src"),
  })
  await docker.pushImage(`${name}:latest`)
}

export default run
