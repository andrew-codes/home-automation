import { ConfigurationApi } from "@ha/configuration-api"
import { SecretClient } from "@azure/keyvault-secrets"
import { ClientSecretCredential } from "@azure/identity"
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"

const configurationNames = [
  "alexa-shopping-list-updater/port/external",
  "azure/location",
  "azure/resource-group",
  "captive-portal/port/external",
  "docker-registry/email",
  "docker-registry/ip",
  "docker-registry/machine/password",
  "docker-registry/password",
  "docker-registry/port/external",
  "docker-registry/username",
  "double-take/port/external",
  "dynamic-dns/cert-email",
  "dynamic-dns/service-account/credentials.json",
  "facebox/mb-key",
  "facebox/port/external",
  "frigate/port/external",
  "frigate/port/external/rmtp",
  "frigate/rtsp/car-port",
  "frigate/rtsp/front-door",
  "github/token",
  "grafana/influxdb/token",
  "grafana/password",
  "grafana/port/external",
  "grafana/username",
  "guest-pin-codes/calendar-id",
  "guest-pin-codes/door-locks",
  "guest-pin-codes/google-private-key",
  "guest-pin-codes/guest-code-index-offset",
  "guest-pin-codes/guest-lock-code-exclusions",
  "guest-pin-codes/number-of-guest-codes",
  "home-assistant/appdaemon/password",
  "home-assistant/appdaemon/url",
  "home-assistant/domain",
  "home-assistant/double-take/token",
  "home-assistant/elevation",
  "home-assistant/game-room/gaming-pc/ip",
  "home-assistant/game-room/gaming-pc/mac",
  "home-assistant/game-room/gaming-pc/machine-username",
  "home-assistant/game-room/nvidia-shield/ip",
  "home-assistant/game-room/playstation-5/ip",
  "home-assistant/game-room/tv/ip",
  "home-assistant/game-room/tv/mac",
  "home-assistant/google/calendar/client-id",
  "home-assistant/google/calendar/client-secret",
  "home-assistant/home-automation-private-ssh-key",
  "home-assistant/home-automation-public-ssh-key",
  "home-assistant/influxdb/token",
  "home-assistant/jira-authorization-header",
  "home-assistant/latitude",
  "home-assistant/longitude",
  "home-assistant/port/external",
  "home-assistant/postgres/db",
  "home-assistant/postgres/password",
  "home-assistant/postgres/user",
  "home-assistant/spotcast/dc-2",
  "home-assistant/spotcast/dc",
  "home-assistant/spotcast/key-2",
  "home-assistant/spotcast/key",
  "home-assistant/spotify/client-id",
  "home-assistant/spotify/client-secret",
  "home-assistant/time-zone",
  "home-assistant/token",
  "home-assistant/unit-system",
  "home-assistant/url",
  "home-assistant/withings/client-id",
  "home-assistant/withings/client-secret",
  "influxdb/bucket",
  "influxdb/org",
  "influxdb/password",
  "influxdb/port/external",
  "influxdb/username",
  "k8s-main-node/ip",
  "mqtt/password",
  "mqtt/port/external",
  "mqtt/username",
  "openvpn/admin/password",
  "openvpn/ip",
  "pihole/ip",
  "pihole/password",
  "pihole/search-domain",
  "proxmox/host",
  "proxmox/password",
  "proxmox/username",
  "proxy/ip",
  "ps5/credentials.json",
  "unifi/ip",
  "unifi/password",
  "unifi/port",
  "unifi/username",
  "uptime-kuma/port/external",
  "zigbee2mqtt/port/external",
  "zwavejs/port/external",
  "zwavejs/port/external/web-socket",
] as const

type ConfigurationKeys = typeof configurationNames
type AzureKvConfiguration = Record<ConfigurationKeys[number], string>

const createConfigApi = async (): Promise<
  ConfigurationApi<AzureKvConfiguration>
> => {
  const keyVaultName = await EnvSecretsConfiguration.get("azure/key-vault/name")
  const tenantId = await EnvSecretsConfiguration.get("azure/tenant/id")
  const clientId = await EnvSecretsConfiguration.get("azure/client/id")
  const clientSecret = await EnvSecretsConfiguration.get("azure/client/secret")
  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret,
  )
  const url = `https://${keyVaultName}.vault.azure.net`
  const client = new SecretClient(url, credential)

  return {
    get: async (name) => {
      const secret = await client.getSecret(name)
      return secret.value as AzureKvConfiguration[typeof name]
    },
    getNames: () => configurationNames,
    set: async (name, value) => {},
  }
}

export type { AzureKvConfiguration as Configuration }
export { createConfigApi, configurationNames }