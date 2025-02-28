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
    dockerFile: path.join("src", "clients.Dockerfile"),
    context: "src",
  })
}

export default run
