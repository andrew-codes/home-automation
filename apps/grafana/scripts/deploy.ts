import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"
import yaml from "yaml"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)

  await kube.exec(`helm repo add grafana https://grafana.github.io/helm-charts`)
  await kube.exec(`helm repo update`)

  const output = await kube.exec(`helm list -q -n default`)
  if (output.includes("grafana")) {
    await kube.exec(`helm uninstall grafana`)
  }
  const grafanaUsername = (await configurationApi.get("grafana/username")).value
  const grafanaPassword = (await configurationApi.get("grafana/password")).value
  const grafanaValuesJsonnet = await jsonnet.eval(
    path.join(__dirname, "../src/deployment/grafanaValues.jsonnet"),
    {
      adminUsername: grafanaUsername,
      adminPassword: grafanaPassword,
    },
  )
  const grafanaValuesYaml = yaml.stringify(JSON.parse(grafanaValuesJsonnet), {
    defaultStringType: "QUOTE_SINGLE",
    minContentWidth: 0,
  })

  await kube.exec(
    `cat << 'EOF' | helm install grafana grafana/grafana -f -
${grafanaValuesYaml}
EOF`,
  )
}

export default run
