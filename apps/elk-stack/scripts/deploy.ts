import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.exec(
    `kubectl create -f https://download.elastic.co/downloads/eck/2.3.0/crds.yaml;`,
  )
  sh.exec(
    `kubectl apply -f https://download.elastic.co/downloads/eck/2.3.0/operator.yaml;`,
  )

  const elasticPort = await configurationApi.get(
    "elk-stack/elastic-search/port/external",
  )
  const kibanaPort = await configurationApi.get(
    "elk-stack/kibana/port/external",
  )
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      secrets: [],
      elasticPort: parseInt(elasticPort.value),
      kibanaPort: parseInt(kibanaPort.value),
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )
}

export default run
