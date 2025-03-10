import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { kubectl } from "@ha/kubectl"
import { logger } from "@ha/logger"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const hostname = `${
    (await configurationApi.get("docker-registry/hostname")).value
  }`
  const username = (await configurationApi.get("docker-registry/username"))
    .value
  const password = (await configurationApi.get("docker-registry/password"))
    .value
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const githubEmail = (await configurationApi.get("github/email")).value

  const kube = kubectl(kubeConfig)

  try {
    await kube.exec(`kubectl delete secret --namespace default regcred`)
  } catch (e) {
    logger.warn("regcred secret may already exist.")
  }
  await kube.exec(
    `kubectl create secret docker-registry regcred --namespace default --docker-username="${username}" --docker-password="${password}" --docker-server="${hostname}" --docker-email="${githubEmail}";`,
  )
}

export default run
