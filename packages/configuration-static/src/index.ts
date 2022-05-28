import { ConfigurationApi } from "@ha/configuration-api"

type StaticConfiguration = {
  externalDockerRegistryPort: number
  externalHaPort: number
  externalZigbee2MqttPort: number
  externalCaptivePortalPort: number
  externalUptimePort: number
  externalGrafanaPort: number
  externalMqttPort: number
  externalInfluxdbPort: number
  externalZwavejsPort: number
  externalZwavejsWsPort: number
  externalFrigatePort: number
  externalFrigateRmtpPort: number
  externalFaceboxPort: number
  externalDoubleTakePort: number
  externalAlexaSkillPort: number
  gatewayIp: string
  nameserverIp: string
  searchDomain: string
  prodDockerIp: string
  prodK8sMainNodeIp: string
  prodVpnIp: string
  prodPiholeIp: string
  prodProxyIp: string
  azureResourceGroup: string
  azureKeyVaultName: string
  azureLocation: string
}

const configurationMap: StaticConfiguration = {
  externalDockerRegistryPort: 30500,
  externalHaPort: 30514,
  externalZigbee2MqttPort: 30515,
  externalCaptivePortalPort: 30516,
  externalUptimePort: 30517,
  externalGrafanaPort: 30518,
  externalMqttPort: 30519,
  externalInfluxdbPort: 30520,
  externalZwavejsPort: 30251,
  externalZwavejsWsPort: 30522,
  externalFrigatePort: 30523,
  externalFrigateRmtpPort: 30524,
  externalFaceboxPort: 30525,
  externalDoubleTakePort: 30529,
  externalAlexaSkillPort: 30526,
  gatewayIp: "192.168.1.0",
  nameserverIp: "192.168.1.15",
  searchDomain: "lan",
  prodDockerIp: "192.168.1.17",
  prodK8sMainNodeIp: "192.168.1.18",
  prodVpnIp: "192.168.1.16",
  prodPiholeIp: "192.168.1.15",
  prodProxyIp: "192.168.1.20",
  azureResourceGroup: "rg-home-automation",
  azureKeyVaultName: "kv-home-automation",
  azureLocation: "East US",
}

const configurationApi: ConfigurationApi<StaticConfiguration> = {
  get: async (name) => configurationMap[name],
}

export type { StaticConfiguration as Configuration }
export { configurationApi }
