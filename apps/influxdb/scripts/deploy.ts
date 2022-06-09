import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port = await configurationApi.get("influxdb/port/external")
  const DOCKER_INFLUXDB_INIT_USERNAME = await configurationApi.get(
    "influxdb/username",
  )
  const DOCKER_INFLUXDB_INIT_PASSWORD = await configurationApi.get(
    "influxdb/password",
  )
  const DOCKER_INFLUXDB_INIT_ORG = await configurationApi.get("influxdb/org")
  const DOCKER_INFLUXDB_INIT_BUCKET = await configurationApi.get(
    "influxdb/bucket",
  )
  const secrets: Array<keyof Configuration> = []
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: "influxdb:2.2.0",
      name,
      DOCKER_INFLUXDB_INIT_USERNAME,
      DOCKER_INFLUXDB_INIT_PASSWORD,
      DOCKER_INFLUXDB_INIT_ORG,
      DOCKER_INFLUXDB_INIT_BUCKET,
      port: parseInt(port, 10),
      secrets: JSON.stringify(secrets),
    },
  )
  const resourceJson = JSON.parse(resources)
  Object.values(resourceJson).forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
