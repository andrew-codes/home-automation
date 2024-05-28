import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  const hostname = await configurationApi.get("docker-registry/hostname")
  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")

  const deleteOldCreds = sh.exec(
    `kubectl delete secret --namespace default regcred || true;`,
    {
      silent: true,
    },
  )
  await throwIfError(deleteOldCreds)

  const createCreds = sh.exec(
    `kubectl create secret docker-registry regcred --namespace default --docker-username="${username.value}" --docker-password="${password.value}" --docker-server="${hostname.value}";`,
    { silent: true },
  )
  await throwIfError(createCreds)

  const githubEmail = await configurationApi.get("github/email")
  const githubCrToken = await configurationApi.get("github/cr/token")
  const deleteOldGhcrio = sh.exec(
    `kubectl delete secret --namespace default ghcr || true;`,
    {
      silent: true,
    },
  )
  await throwIfError(deleteOldGhcrio)

  const createGhcrioCreds = sh.exec(
    `kubectl create secret docker-registry ghcr --namespace default --docker-username="${githubEmail.value}" --docker-password="${githubCrToken.value}" --docker-email="${githubEmail.value}" --docker-server="ghcr.io";`,
    { silent: true },
  )
  await throwIfError(createGhcrioCreds)
}

export default run
