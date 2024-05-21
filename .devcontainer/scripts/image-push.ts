import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"
import { throwIfError } from "@ha/shell-utils"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  await createClient(configurationApi)
  const registry = await configurationApi.get("docker-registry/hostname")

  throwIfError(
    sh.exec(
      `devpod build ${path.join(__dirname, "..")} --repository ${
        registry.value
      }/home-automation/devcontainer --provider docker`,
    ),
  )
}

export default run
