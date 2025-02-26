import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  sh.env["KUBECONFIG"] = kubeConfig
  sh.exec(
    `kubectl create -f https://download.elastic.co/downloads/eck/2.9.0/crds.yaml;`,
  )
  sh.exec(
    `kubectl apply -f https://download.elastic.co/downloads/eck/2.9.0/operator.yaml;`,
  )

  const elasticPort = await configurationApi.get(
    "elk-stack/elastic-search/port/external",
  )
  const kibanaPort = await configurationApi.get(
    "elk-stack/kibana/port/external",
  )
  const logStashPort = await configurationApi.get(
    "elk-stack/logstash/port/external",
  )
  const k8sMainIp = await configurationApi.get("k8s/main-node/ip")
  const elasticUser = await configurationApi.get("crowdsec/elastic/username")
  const elasticPassword = await configurationApi.get(
    "crowdsec/elastic/password",
  )

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      secrets: [],
      elasticPort: parseInt(elasticPort.value),
      kibanaPort: parseInt(kibanaPort.value),
      k8sIp: k8sMainIp.value,
      elasticUser: elasticUser.value,
      elasticPassword: elasticPassword.value,
      logStashPort: logStashPort.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  const kube = kubectl(kubeConfig)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )
}

export default run
