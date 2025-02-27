import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = (await configurationApi.get("docker-registry/ip")).value
  const hostname = (await configurationApi.get("docker-registry/name")).value
  const username = (await configurationApi.get("docker-registry/username"))
    .value
  const password = (await configurationApi.get("docker-registry/password"))
    .value
  const auth = await throwIfError(
    sh.exec(
      `docker run --entrypoint htpasswd httpd:2 -Bbn ${username} ${password}`,
      { silent: true },
    ),
  )

  await runPlaybook(
    path.join(__dirname, "..", "src", "deployment", "deploy.yml"),
    [ip],
    {
      hostname,
      auth,
    },
  )
}

export default run
