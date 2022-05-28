import { ConfigurationApi } from "@ha/configuration-api"
import { SecretClient } from "@azure/keyvault-secrets"
import { ClientSecretCredential } from "@azure/identity"
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"

type LegacyAzureKvConfiguration = {
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
  "home-assistant-SPOTCAST-DC-2": string
  "home-assistant-SPOTCAST-DC": string
  "home-assistant-SPOTCAST-KEY-2": string
  "home-assistant-SPOTCAST-KEY": string
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

type AzureKvConfiguration = {
  "alexa-shopping-list-updater/port/external": string
  "azure/location": string
  "azure/resource-group": string
  "captive-portal/port/external": string
  "docker-registry/email": string
  "docker-registry/ip": string
  "docker-registry/machine/password": string
  "docker-registry/password": string
  "docker-registry/port/external": string
  "docker-registry/username": string
  "double-take/port/external": string
  "dynamic-dns/cert-email": string
  "dynamic-dns/service-account/credentials.json": string
  "facebox/mb-key": string
  "facebox/port/external": string
  "frigate/port/external": string
  "frigate/port/external/rmtp": string
  "frigate/rtsp/car-port": string
  "frigate/rtsp/front-door": string
  "github/token": string
  "grafana/influxdb/token": string
  "grafana/password": string
  "grafana/port/external": string
  "grafana/username": string
  "guest-pin-codes/calendar-id": string
  "guest-pin-codes/door-locks": string
  "guest-pin-codes/google-private-key": string
  "guest-pin-codes/guest-code-index-offset": string
  "guest-pin-codes/guest-lock-code-exclusions": string
  "guest-pin-codes/number-of-guest-codes": string
  "home-assistant/appdaemon/password": string
  "home-assistant/appdaemon/url": string
  "home-assistant/domain": string
  "home-assistant/double-take/token": string
  "home-assistant/elevation": string
  "home-assistant/game-room/gaming-pc/ip": string
  "home-assistant/game-room/gaming-pc/mac": string
  "home-assistant/game-room/gaming-pc/machine-username": string
  "home-assistant/game-room/nvidia-shield/ip": string
  "home-assistant/game-room/playstation-5/ip": string
  "home-assistant/game-room/tv/ip": string
  "home-assistant/game-room/tv/mac": string
  "home-assistant/google/calendar/client-id": string
  "home-assistant/google/calendar/client-secret": string
  "home-assistant/home-automation-private-ssh-key": string
  "home-assistant/home-automation-public-ssh-key": string
  "home-assistant/influxdb/token": string
  "home-assistant/jira-authorization-header": string
  "home-assistant/latitude": string
  "home-assistant/longitude": string
  "home-assistant/port/external": string
  "home-assistant/postgres/db": string
  "home-assistant/postgres/password": string
  "home-assistant/postgres/user": string
  "home-assistant/spotcast/dc-2": string
  "home-assistant/spotcast/dc": string
  "home-assistant/spotcast/key-2": string
  "home-assistant/spotcast/key": string
  "home-assistant/spotify/client-id": string
  "home-assistant/spotify/client-secret": string
  "home-assistant/time-zone": string
  "home-assistant/token": string
  "home-assistant/unit-system": string
  "home-assistant/url": string
  "home-assistant/withings/client-id": string
  "home-assistant/withings/client-secret": string
  "influxdb/bucket": string
  "influxdb/org": string
  "influxdb/password": string
  "influxdb/port/external": string
  "influxdb/username": string
  "k8s-main-node/ip": string
  "mqtt/password": string
  "mqtt/port/external": string
  "mqtt/username": string
  "openvpn/admin/password": string
  "openvpn/ip": string
  "pihole/ip": string
  "pihole/password": string
  "pihole/search-domain": string
  "proxmox/host": string
  "proxmox/password": string
  "proxmox/username": string
  "proxy/ip": string
  "ps5/credentials.json": string
  "unifi/ip": string
  "unifi/password": string
  "unifi/port": string
  "unifi/username": string
  "uptime-kuma/port/external": string
  "zigbee2mqtt/port/external": string
  "zwavejs/port/external": string
  "zwavejs/port/external/web-socket": string
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
