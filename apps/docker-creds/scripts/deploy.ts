import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { kubectl } from "@ha/kubectl"
import { logger } from "@ha/logger"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const hostname = (await configurationApi.get("docker-registry/hostname"))
    .value
  const username = (await configurationApi.get("docker-registry/username"))
    .value
  const password = (await configurationApi.get("docker-registry/password"))
    .value
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)

  try {
    await kube.exec(`kubectl delete secret --namespace default regcred`)
  } catch (e) {
    logger.warn("regcred secret may already exist.")
  }
  await kube.exec(
    `kubectl create secret docker-registry regcred --namespace default --docker-username="${username}" --docker-password="${password}" --docker-server="${hostname}";`,
  )

  const githubEmail = (await configurationApi.get("github/email")).value
  const githubCrToken = (await configurationApi.get("github/cr/token")).value
  try {
    await kube.exec(`kubectl delete secret --namespace default ghcr`)
  } catch (e) {
    logger.warn("ghcr secret may already exist.")
  }
  await kube.exec(
    `kubectl create secret docker-registry ghcr --namespace default --docker-username="${githubEmail}" --docker-password="${githubCrToken}" --docker-email="${githubEmail}" --docker-server="ghcr.io";`,
  )
}

export default run
