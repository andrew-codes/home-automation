import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const nfsIp = await configurationApi.get("nfs/ip")

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      nfsIp: nfsIp.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map(async (resource) => {
      await kubectl.applyToCluster(JSON.stringify(resource))
    }),
  )

  sh.exec(
    `helm repo add blakeblackshear https://blakeblackshear.github.io/blakeshome-charts/`,
  )
  sh.exec(
    `helm upgrade --install frigate blakeblackshear/frigate -f values.yaml`,
  )

  const patch = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "patch.jsonnet"),
  )
  const patchJson = JSON.parse(patch)
  sh.exec(`kubectl patch deployment frigate -p '${JSON.stringify(patchJson)}'`)

  await kubectl.rolloutDeployment("restart", "frigate")
}

export default run
