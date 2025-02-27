import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const nfsIp = (await configurationApi.get("nfs/ip")).value
  const config = (await configurationApi.get("cloudflared/config")).value

  const secrets: Array<keyof Configuration> = []
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "src", "deployment", "index.jsonnet"),
    {
      secrets,
      nfsIp: nfsIp,
      config: config.replace(/\\n/g, "\n"),
    },
  )
  const resourceJson = JSON.parse(resources)

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kube.rolloutDeployment("restart", "cloudflared")
}

export default run
