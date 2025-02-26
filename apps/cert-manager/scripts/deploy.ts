import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const certs = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "certs.yml"),
    {},
  )

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)

  await kube.applyToCluster(certs)
  await kube.rolloutDeployment("restart", "cloudflared")
}

export default run
