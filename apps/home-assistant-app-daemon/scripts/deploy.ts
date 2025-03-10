import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secrets: Array<keyof Configuration> = []
  const haUrl = (await configurationApi.get("home-assistant/url")).value
  const token = (await configurationApi.get("home-assistant/token")).value
  const registryScopeName = (await configurationApi.get("docker-registry/name"))
    .value
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "src", "deployment", "index.jsonnet"),
    {
      image: "acockburn/appdaemon:4.4.2",
      name,
      secrets,
      haUrl,
      registryScopeName,
      token,
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
