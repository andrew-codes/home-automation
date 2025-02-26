import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { kubectl } from "@ha/kubectl"
import fs from "fs/promises"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = (await configurationApi.get("k8s/main-node/ip")).value
  const networkCIDR = (await configurationApi.get("k8s/pod-network-cidr")).value
  const hostname = (await configurationApi.get("k8s/name")).value

  const secretsPath = path.join(__dirname, "..", ".secrets")
  await fs.mkdir(secretsPath, { recursive: true })

  await runPlaybook(
    path.join(__dirname, "..", "src", "deployment", "deploy.yml"),
    [ip],
    {
      pod_network_cidr: networkCIDR,
      hostname,
    },
  )

  const kubeConfigPath = path.join(secretsPath, ".kube", "config")
  const kubeConfig = await fs.readFile(kubeConfigPath, "utf8")
  configurationApi.set("k8s/config", kubeConfig)
  const kube = kubectl(kubeConfig)
  await kube.exec(`kubectl create sa app;`)
}

export default run
