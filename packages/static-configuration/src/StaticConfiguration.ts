import { ConfigurationApi } from "./ConfigurationApi.types"
type StaticConfiguration = {
  externalDockerRegistryPort
  externalHaPort
  externalZigbee2MqttPort
  externalCaptivePortalPort
  externalUptimePort
  externalGrafanaPort
  externalMqttPort
  externalInfluxdbPort
  externalZwavejsPort
  externalZwavejsWsPort
  externalFrigatePort
  externalFrigateRmtpPort
  externalFaceboxPort
  externalDoubleTakePort
  externalAlexaSkillPort
  gatewayIp
  nameserverIp
  searchDomain
  prodDockerIp
  prodK8sMainNodeIp
  prodVpnIp
  prodPiholeIp
  prodProxyIp
  azureResourceGroup
  azureKeyVaultName
  azureLocation
}

const staticConfiguration = {}

const StaticConifiguration: ConfigurationApi<StaticConfiguration> = {
  get: async (name) => staticConfiguration[name],
}
export type { StaticConfiguration }
