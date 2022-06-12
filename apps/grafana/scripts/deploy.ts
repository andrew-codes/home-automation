import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const grafana_username = await configurationApi.get("grafana/username")
  const grafana_password = await configurationApi.get("grafana/password")
  const port = await configurationApi.get("grafana/port/external")
  const grafana_influxdb_token = await configurationApi.get(
    "grafana/influxdb/token",
  )
  const deployments = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      grafana_username,
      grafana_password,
      port,
      grafana_influxdb_token,
    },
  )
  const deploymentsJson = JSON.parse(deployments).grafana
  Object.values(deploymentsJson).forEach((deployment) => {
    kubectl.applyToCluster(JSON.stringify(deployment))
  })

  kubectl.rolloutDeployment("restart", "grafana")
}

export default run
