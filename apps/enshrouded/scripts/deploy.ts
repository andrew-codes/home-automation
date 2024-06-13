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
  const nfsUsername = await configurationApi.get("nfs/username")
  const nfsPassword = await configurationApi.get("nfs/password")
  const nfsIp = await configurationApi.get("nfs/ip")
  const porttcp = await configurationApi.get("enshrouded/port/external/tcp")
  const portudp = await configurationApi.get("enshrouded/port/external/udp")
  const secrets: Array<keyof Configuration> = ["enshrouded/password"]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      name,
      secrets,
      porttcp: porttcp.value,
      portudp: portudp.value,
      nfsPassword: nfsPassword.value,
      nfsUsername: nfsUsername.value,
      nfsIp: nfsIp.value,
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
