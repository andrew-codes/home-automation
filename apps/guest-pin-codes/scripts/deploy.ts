import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker-registry/hostname")
  const secrets: Array<keyof Configuration> = [
    "mqtt/password",
    "mqtt/username",
    "guest-pin-codes/door-locks",
    "guest-pin-codes/calendar-id",
    "guest-pin-codes/google-private-key",
    "guest-pin-codes/guest-code-index-offset",
    "guest-pin-codes/guest-lock-code-exclusions",
    "guest-pin-codes/number-of-guest-codes",
    "unifi/ip",
    "unifi/password",
    "unifi/port",
    "unifi/username",
  ]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry.value}/${name}:latest`,
      name,
      registryHostname: registry.value,
      secrets,
    },
  )
  const resourceJson = JSON.parse(resources)
  resourceJson.forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
