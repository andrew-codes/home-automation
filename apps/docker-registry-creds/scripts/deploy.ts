import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")
  const email = await configurationApi.get("docker-registry/email")

  const deleteOldCreds = sh.exec(`kubectl delete secret regcred || true`)
  throwIfError(deleteOldCreds)

  const createCreds = sh.exec(
    `kubectl create secret docker-registry regcred --docker-username="${username}" --docker-password="${password}" --docker-email="${email}" --docker-server="docker-registry"`,
  )
  throwIfError(createCreds)
}

export default run
