import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker/registry/hostname")
  const dbPort = await configurationApi.get("game-library-db/port")
  const dbUsername = await configurationApi.get("game-library-db/username")
  const dbPassword = await configurationApi.get("game-library-db/password")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      dbUsername,
      dbPassword,
      image: `${registry}/${name}:latest`,
      name,
      registryHostname: registry,
      dbPort
    },
  )
  const resourceJson = JSON.parse(resources)
  resourceJson.forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
