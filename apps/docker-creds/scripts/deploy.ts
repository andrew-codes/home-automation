import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  const hostname = await configurationApi.get("docker-registry/hostname")
  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")

  const deleteOldCreds = sh.exec(`kubectl delete secret regcred || true;`, {
    silent: true,
  })
  await throwIfError(deleteOldCreds)

  const createCreds = sh.exec(
    `kubectl create secret docker-registry regcred --docker-username="${username.value}" --docker-password="${password.value}" --docker-server="${hostname.value}";`,
    { silent: true },
  )
  await throwIfError(createCreds)
}

export default run
