import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port = await configurationApi.get("influxdb/port/external")
  const nfsIp = await configurationApi.get("nfs/ip")
  const DOCKER_INFLUXDB_INIT_USERNAME =
    await configurationApi.get("influxdb/username")
  const DOCKER_INFLUXDB_INIT_PASSWORD =
    await configurationApi.get("influxdb/password")
  const DOCKER_INFLUXDB_INIT_ORG = await configurationApi.get("influxdb/org")
  const DOCKER_INFLUXDB_INIT_BUCKET =
    await configurationApi.get("influxdb/bucket")
  const secrets: Array<keyof Configuration> = []

  const registry = await configurationApi.get("docker-registry/hostname")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry.value}/influxdb:latest`,
      name,
      telegrafImage: `${registry.value}/telegraf:latest`,
      DOCKER_INFLUXDB_INIT_USERNAME: DOCKER_INFLUXDB_INIT_USERNAME.value,
      DOCKER_INFLUXDB_INIT_PASSWORD: DOCKER_INFLUXDB_INIT_PASSWORD.value,
      DOCKER_INFLUXDB_INIT_ORG: DOCKER_INFLUXDB_INIT_ORG.value,
      DOCKER_INFLUXDB_INIT_BUCKET: DOCKER_INFLUXDB_INIT_BUCKET.value,
      port: parseInt(port.value),
      secrets,
      nfsIp: nfsIp.value,
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
