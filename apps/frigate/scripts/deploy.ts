import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const kubeConfig = (await configurationApi.get("k8s/config")).value

  const nfsIp = await configurationApi.get("nfs/ip")

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {},
  )
  const resourceJson = JSON.parse(resources)

  const kube = kubectl(kubeConfig)
  await Promise.all(
    resourceJson.map(async (resource) => {
      await kube.applyToCluster(JSON.stringify(resource))
    }),
  )

  await kube.exec(
    `helm repo add blakeblackshear https://blakeblackshear.github.io/blakeshome-charts/`,
  )
  await kube.exec(
    `helm upgrade --install frigate blakeblackshear/frigate -f values.yaml`,
  )

  const patch = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "patch.jsonnet"),
  )
  const patchJson = JSON.parse(patch)
  await kube.exec(
    `kubectl patch deployment frigate -p '${JSON.stringify(patchJson)}'`,
  )

  await kube.rolloutDeployment("restart", "frigate")
}

export default run
