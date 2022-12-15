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
  // const port_external = await configurationApi.get("frigate/port/external")
  // const external_rmtp_port = await configurationApi.get(
  //   "frigate/port/external/rmtp",
  // )
  // const secrets: Array<keyof Configuration> = [
  //   "frigate/rtsp/car-port",
  //   "frigate/rtsp/front-door",
  // ]
  // const resources = await jsonnet.eval(
  //   path.join(__dirname, "..", "deployment", "index.jsonnet"),
  //   {
  //     image: `${registry}/${name}:latest`,
  //     name,
  //     registryHostname: registry,
  //     secrets,
  //     port: parseInt(port_external),
  //     external_rmtp_port: parseInt(parseInt(external_rmtp_port)),
  //   },
  // )
  // const resourceJson = JSON.parse(resources)
  // resourceJson.forEach((resource) => {
  //   await kubectl.applyToCluster(JSON.stringify(resource))
  // })

  // await kubectl.rolloutDeployment("restart", name)
}

export default run
