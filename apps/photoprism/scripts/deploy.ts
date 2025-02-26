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
  const externalPort = await configurationApi.get("photoprism/port/external")

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  sh.env["KUBECONFIG"] = kubeConfig

  const secrets: Array<keyof Configuration> = []
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: "photoprism/photoprism:latest",
      name,
      secrets,
      port: parseInt(externalPort.value),
      dbImage: "mariadb:10.11",
    },
  )

  sh.exec(`kubectl delete deployment ${name}`)
  const resourceJson = JSON.parse(resources)
  const kube = kubectl(kubeConfig)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )
}

export default run
