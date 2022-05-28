import { ConfigurationApi } from "@ha/configuration-api"
import { SecretClient } from "@azure/keyvault-secrets"
import { ClientSecretCredential } from "@azure/identity"
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"

type AzureKvConfiguration = {
  "alexa-shopping-list-skill-DNS-DOMAIN": string
  "alexa-shopping-list-skill-DNS-PASSWORD": string
  "alexa-shopping-list-skill-DNS-USERNAME": string
  "alexa-shopping-list-skill-INLETS-IP": string
  "azure-service-principal-app-id": string
  "azure-service-principal-password": string
  "azure-service-principal-tenant-id": string
  "azure-subscription-id": string
  "captive-portal-DOMAIN": string
  "dns-cert-email": string
  "dns-google-service-account-creds": string
  "docker-influxdb-init-bucket": string
  "docker-influxdb-init-org": string
  "docker-influxdb-init-password": string
  "docker-influxdb-init-username": string
  "docker-registry-EMAIL": string
  "docker-registry-MACHINE-PASSWORD": string
  "docker-registry-PASSWORD": string
  "docker-registry-USERNAME": string
  "facebox-MB-KEY": string
  "frigate-CAR-PORT-DOOR-RTSP": string
  "frigate-FRONT-DOOR-RTSP": string
  "github-action-runners-GITHUB-ACTION-JEST-REPORTER-TOKEN": string
  "github-action-runners-GITHUB-TOKEN": string
  "github-action-runners-HOME-AUTOMATION-PRIVATE-SSH-KEY": string
  "github-action-runners-HOME-AUTOMATION-PUBLIC-KEY": string
  "grafana-github-client-id": string
  "grafana-github-client-secret": string
  "grafana-influxdb-token": string
  "grafana-password": string
  "grafana-username": string
  "guest-pin-codes-DOOR-LOCKS": string
  "guest-pin-codes-GOOGLE-CALENDAR-ID": string
  "guest-pin-codes-GOOGLE-PRIVATE-KEY": string
  "guest-pin-codes-GUEST-CODE-INDEX-OFFSET": string
  "guest-pin-codes-GUEST-LOCK-CODE-EXCLUSIONS": string
  "guest-pin-codes-NUMBER-OF-GUEST-CODES": string
  "home-assistant-APPDAEMON-PASSWORD": string
  "home-assistant-APPDAEMON-URL": string
  "home-assistant-DOUBLE-TAKE-TOKEN": string
  "home-assistant-ELEVATION": string
  "home-assistant-GAMING-ROOM-GAMING-PC-IP": string
  "home-assistant-GAMING-ROOM-GAMING-PC-MAC": string
  "home-assistant-GAMING-ROOM-MACHINE-USERNAME": string
  "home-assistant-GAMING-ROOM-NVIDIA-SHIELD-IP": string
  "home-assistant-GAMING-ROOM-PLAYSTATION-5-IP": string
  "home-assistant-GAMING-ROOM-TV-IP": string
  "home-assistant-GAMING-ROOM-TV-MAC": string
  "home-assistant-GOOGLE-CALENDAR-CLIENT-ID": string
  "home-assistant-GOOGLE-CALENDAR-CLIENT-SECRET": string
  "home-assistant-HA-DOMAIN": string
  "home-assistant-HA-TOKEN": string
  "home-assistant-HA-URL": string
  "home-assistant-HOME-AUTOMATION-PRIVATE-SSH-KEY": string
  "home-assistant-HOME-AUTOMATION-PUBLIC-SSH-KEY": string
  "home-assistant-JIRA-AUTHORIZATION-HEADER": string
  "home-assistant-LATITUDE": string
  "home-assistant-LONGITUDE": string
  "home-assistant-POSTGRES-DB": string
  "home-assistant-POSTGRES-PASSWORD": string
  "home-assistant-POSTGRES-USER": string
  "home-assistant-PROXMOX-HOST": string
  "home-assistant-PROXMOX-PASSWORD": string
  "home-assistant-PROXMOX-USERNAME": string
  "home-assistant-ROUTER-IP": string
  "home-assistant-SPOTCAST-DC": string
  "home-assistant-SPOTCAST-DC-2": string
  "home-assistant-SPOTCAST-KEY": string
  "home-assistant-SPOTCAST-KEY-2": string
  "home-assistant-SPOTIFY-CLIENT-ID": string
  "home-assistant-SPOTIFY-CLIENT-SECRET": string
  "home-assistant-TIME-ZONE": string
  "home-assistant-UNIT-SYSTEM": string
  "home-assistant-WITHINGS-CLIENT-ID": string
  "home-assistant-WITHINGS-CLIENT-SECRET": string
  "influxdb-home-assistant-token": string
  "inlets-INLETS-PRO-LICENSE": string
  "k8s-CLUSTER-IP": string
  "k8s-MACHINE-PASSWORD": string
  "k8s-POD-NETWORK-CIDR": string
  "known-hosts": string
  "lets-encrypt-EMAIL": string
  "mqtt-PASSWORD": string
  "mqtt-USERNAME": string
  "openvpn-PASSWORD": string
  "pihole-PASSWORD": string
  "ps5-CREDENTIALS": string
  "ps5-PS5-NAMES": string
  "unifi-IP": string
  "unifi-PASSWORD": string
  "unifi-PORT": string
  "unifi-USERNAME": string
}

const configurationApi: ConfigurationApi<AzureKvConfiguration> = {
  get: async (name) => {
    const keyVaultName = await EnvSecretsConfiguration.get("azureKeyVaultName")
    const tenantId = await EnvSecretsConfiguration.get("azureTenantId")
    const clientId = await EnvSecretsConfiguration.get("azureClientId")
    const clientSecret = await EnvSecretsConfiguration.get("azureClientSecret")
    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret,
    )
    const url = `https://${keyVaultName}.vault.azure.net`
    const client = new SecretClient(url, credential)
    const secret = await client.getSecret(name)
    return secret.value as AzureKvConfiguration[typeof name]
  },
}

export type { AzureKvConfiguration as Configuration }
export { configurationApi }
