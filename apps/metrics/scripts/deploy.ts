import { runPlaybook } from "@ha/ansible"
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

  await kube.exec(
    `helm repo add vm https://victoriametrics.github.io/helm-charts/`,
  )
  await kube.exec(`helm repo update`)

  const output = await kube.exec(`helm list -q -n default`)
  if (!output.includes("vmoperator")) {
    await kube.exec(
      `helm install vmoperator vm/victoria-metrics-operator --force`,
    )
  }

  if (!output.includes("vmcluster")) {
    const vmClusterChartValuesJsonnet = await jsonnet.eval(
      path.join(__dirname, "../src/deployment/vmClusterChartValues.jsonnet"),
    )
    const vmClusterChartValuesYaml = yaml.stringify(
      JSON.parse(vmClusterChartValuesJsonnet),
      { defaultStringType: "QUOTE_DOUBLE", minContentWidth: 0 },
    )
    await kube.exec(
      `cat << 'EOF' | helm upgrade --install vmcluster vm/victoria-metrics-cluster -f -
${vmClusterChartValuesYaml}
EOF`,
    )
  }

  if (!output.includes("vmagent")) {
    const vmAgentChartValuesJsonnet = await jsonnet.eval(
      path.join(__dirname, "../src/deployment/vmAgentChartValues.jsonnet"),
    )
    const vmAgentChartValuesYaml = yaml.stringify(
      JSON.parse(vmAgentChartValuesJsonnet),
      { defaultStringType: "QUOTE_DOUBLE", minContentWidth: 0 },
    )
    await kube.exec(
      `cat << 'EOF' |  helm install vmagent vm/victoria-metrics-agent -f -
${vmAgentChartValuesYaml}
EOF`,
    )
  }

  const externalPort = parseInt(
    (await configurationApi.get("influxdb/port/external")).value,
    10,
  )
  const internalServiceResource = await jsonnet.eval(
    path.join(__dirname, "../src/deployment/internalService.jsonnet"),
    {
      externalPort,
    },
  )
  await kube.applyToCluster(internalServiceResource)

  // if (!output.includes("vmauth")) {
  //   await kube.exec(
  //     `helm install vmauth vm/victoria-metrics-auth -f ${path.join(__dirname, "../src/deployment/vmauthValues.yaml")}`,
  //   )
  // }

  const proxmoxIp = (await configurationApi.get("proxmox/ip")).value
  const vmServerIp = (await configurationApi.get("k8s/main-node/ip")).value
  const vmServerPort = parseInt(
    (await configurationApi.get("influxdb/port/external")).value,
    10,
  )
  await runPlaybook(
    path.join(__dirname, "../src/deployment/proxmoxMetricsServer.yml"),
    [proxmoxIp],
    {
      vmServerIp,
      vmServerPort,
    },
  )
}

export default run
