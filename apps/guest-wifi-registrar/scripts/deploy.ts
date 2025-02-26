import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker-registry/hostname")
  const haDomain = await configurationApi.get("home-assistant/domain")
  const secrets: Array<keyof Configuration> = [
    "mqtt/password",
    "mqtt/username",
    "unifi/ip",
    "unifi/password",
    "unifi/port",
    "unifi/username",
    "wifi-porter/location-id",
    "wifi-porter/api-key",
    "wifi-porter/account-password",
  ]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      haDomain: haDomain.value,
      image: `${registry.value}/${name}:latest`,
      name,
      registryHostname: registry.value,
      secrets,
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

  await kube.rolloutDeployment("restart", name)
}

export default run
