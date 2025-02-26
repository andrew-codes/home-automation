import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import sh from "shelljs"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker-registry/hostname")
  const secrets: Array<keyof Configuration> = ["mqtt/password", "mqtt/username"]
  const psnAccounts = await configurationApi.get("psn-accounts")
  const nfsIp = await configurationApi.get("nfs/ip")

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  sh.env["KUBECONFIG"] = kubeConfig

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `ghcr.io/funkeyflo/ps5-mqtt/amd64:latest`,
      name,
      nfsIp: nfsIp.value,
      psnAccounts: psnAccounts.value,
      registryHostname: registry.value,
      secrets,
    },
  )

  const kube = kubectl(kubeConfig)
  sh.exec(`kubectl delete deployment ${name}`)
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )
}

export default run
