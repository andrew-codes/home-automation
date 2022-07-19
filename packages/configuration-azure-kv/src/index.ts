import { ConfigurationApi } from "@ha/configuration-api"
import { SecretClient } from "@azure/keyvault-secrets"
import { ClientSecretCredential } from "@azure/identity"
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"
import { toK8sName } from "@ha/secret-utils"

const configurationNames = [
  "alexa-shopping-list-updater-skill/port/external",
  "azure/location",
  "azure/resource-group",
  "azure/tenant/id",
  "azure/client/id",
  "azure/client/secret",
  "captive-portal/host",
  "captive-portal/port/external",
  "docker/registry/hostname",
  "docker-registry/email",
  "docker-registry/name",
  "docker-registry/ip",
  "docker-registry/machine/password",
  "docker-registry/password",
  "docker-registry/port/external",
  "docker-registry/username",
  "double-take/port/external",
  "external-services-dns-updater/sub-domains",
  "facebox/mb-key",
  "facebox/port/external",
  "frigate/port/external",
  "frigate/port/external/rmtp",
  "frigate/rtsp/car-port",
  "frigate/rtsp/front-door",
  "game-room-remote/port/external",
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
  "home-assistant/github/token",
  "home-assistant/google/calendar/client-id",
  "home-assistant/google/calendar/client-secret",
  "home-assistant/ssh-key/private",
  "home-assistant/ssh-key/public",
  "home-assistant/influxdb/token",
  "home-assistant/jira-authorization-header",
  "home-assistant/latitude",
  "home-assistant/longitude",
  "home-assistant/port/external",
  "home-assistant/postgres/db",
  "home-assistant/postgres/password",
  "home-assistant/postgres/username",
  "home-assistant/server",
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
  "k8s/machine/password",
  "k8s/machine/username",
  "k8s/main-node/ip",
  "k8s/name",
  "k8s/pod-network-cidr",
  "known-hosts",
  "mqtt/password",
  "mqtt/port/external",
  "mqtt/username",
  "openvpn/hostname",
  "openvpn/ip",
  "openvpn/passwords",
  "openvpn/usernames",
  "pihole/hostname",
  "pihole/ip",
  "pihole/password",
  "proxmox/host/pve",
  "proxmox/host/pve-nuc",
  "proxmox/ip",
  "proxmox/nameserver",
  "proxmox/password",
  "proxmox/provision/ssh-key/public",
  "proxmox/ssh-key/private",
  "proxmox/ssh-key/public",
  "proxmox/username",
  "proxy/ddns/cert-email",
  "proxy/ddns/service-account/credentials-json",
  "proxy/hostname",
  "proxy/ip",
  "proxy/sub-domain/redirects",
  "ps5/credentials-json",
  "repository/name",
  "repository/owner",
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
      const secret = await client.getSecret(toK8sName(name))

      return secret.value as AzureKvConfiguration[typeof name]
    },
    getNames: () => configurationNames,
    set: async (name, value) => {
      await client.setSecret(toK8sName(name), value)
    },
  }
}

export type { AzureKvConfiguration as Configuration }
export { createConfigApi, configurationNames }
