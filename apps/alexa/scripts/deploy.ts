import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const nfsUsername = await configurationApi.get("nfs/username")
  const nfsPassword = await configurationApi.get("nfs/password")
  const nfsIp = await configurationApi.get("nfs/ip")
  const registry = await configurationApi.get("docker-registry/hostname")

  const secrets: Array<keyof Configuration> = []
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      whisperImage: `${registry.value}/whisper:latest`,
      secrets,
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

  await kubectl.rolloutDeployment("restart", "piper")
  await kubectl.rolloutDeployment("restart", "whisper")
  await kubectl.rolloutDeployment("restart", "open-wake-word")
}

export default run
