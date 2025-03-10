import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registryScopeName = (await configurationApi.get("docker-registry/name"))
    .value
  const secrets: Array<keyof Configuration> = ["mqtt/password", "mqtt/username"]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registryScopeName}/home-automation-${name}:latest`,
      name,
      secrets,
    },
  )

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)
  try {
    await kube.exec(`kubectl delete deployment ${name}`)
  } catch (error) {}
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )
}

export default run
