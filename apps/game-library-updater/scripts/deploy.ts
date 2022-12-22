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
  const secrets: Array<keyof Configuration> = ["mqtt/password", "mqtt/username"]
  const volumeResources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "volumes.jsonnet"),
  )
  const volumeResourcesJson = JSON.parse(volumeResources)
  try {
    await Promise.all(
      volumeResourcesJson.map((resource) =>
        kubectl.applyToCluster(JSON.stringify(resource)),
      ),
    )
  } catch (error) {
    console.log(error)
  }

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
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", name)
}

export default run
