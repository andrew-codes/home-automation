import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import sh from "shelljs"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const nfsUsername = await configurationApi.get("nfs/username")
  const nfsPassword = await configurationApi.get("nfs/password")
  const nfsIp = await configurationApi.get("nfs/ip")

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      nfsPassword: nfsPassword.value,
      nfsUsername: nfsUsername.value,
      nfsIp: nfsIp.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  Promise.all(
    resourceJson.map(async (resource) => {
      console.log(JSON.stringify(resource))
      await kubectl.applyToCluster(JSON.stringify(resource))
    }),
  )

  sh.exec(
    `helm repo add blakeblackshear https://blakeblackshear.github.io/blakeshome-charts/`,
  )
  sh.exec(
    `helm upgrade --install ${name} blakeblackshear/frigate -f values.yaml`,
  )

  const patch = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "patch.jsonnet"),
  )
  const patchJson = JSON.parse(patch)
  sh.exec(`kubectl patch deployment ${name} -p '${JSON.stringify(patchJson)}'`)

  await kubectl.rolloutDeployment("restart", name)
}

export default run
