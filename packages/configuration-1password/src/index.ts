import { ConfigurationApi } from "@ha/configuration-api"
import { OnePasswordConnect, ItemBuilder, FullItem } from "@1password/connect"
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"

const configurationNames = [
  "captive-portal/host",
  "captive-portal/port/external",
  "dev/ssh-key/public",
  "docker-registry/hostname",
  "docker-registry/ip",
  "docker-registry/machine/username",
  "docker-registry/name",
  "docker-registry/password",
  "docker-registry/username",
  "elk-stack/elastic-search/port/external",
  "elk-stack/kibana/port/external",
  "elk-stack/fleet/ip",
  "elk-stack/fleet/hostname",
  "external-services-dns-updater/sub-domains",
  "game-library-db/port",
  "game-library-db/password",
  "game-library-db/username",
  "game-room-remote/port/external",
  "gaming-pc/ip",
  "gaming-pc/machine/username",
  "gaming-pc/machine/password",
  "gaming-pc/user",
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
  "proxy-internal/ip",
  "proxy-internal/sub-domain/redirects",
  "ps5/credentials-json",
  "remote-codespaces/ip",
  "remote-codespaces/machine/username",
  "remote-codespaces/machine/password",
  "remote-codespaces/name",
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
type OnePasswordConfiguration = Record<
  ConfigurationKeys[number],
  { id: string; value: string }
>

const createConfigApi = async (): Promise<
  ConfigurationApi<OnePasswordConfiguration>
> => {
  const serverURL = await EnvSecretsConfiguration.get("onepassword/server-url")
  const token = await EnvSecretsConfiguration.get("onepassword/token")
  const vaultId = await EnvSecretsConfiguration.get("onepassword/vault-id")
  const op = OnePasswordConnect({
    serverURL,
    token,
    keepAlive: true,
  })

  return {
    get: async (name) => {
      const itemTitle = name
      const itemFieldName = "secret-value"
      const item = await op.getItemByTitle(vaultId, itemTitle)
      const field = item.fields?.find((f) => f.label === itemFieldName)

      if (!item.id || !field?.value) {
        throw new Error(`Configuration value not found, ${name}.`)
      }

      return {
        id: item.id,
        value: field.value,
      }
    },
    getNames: () => configurationNames,
    set: async (name, value) => {
      const itemTitle = name
      const itemFieldName = "secret-value"
      const items = await op.listItems(vaultId)
      const existingItem = items.find((i) => i.title === itemTitle)
      let item: FullItem
      if (!!existingItem?.id) {
        item = await op.getItemById(vaultId, existingItem.id)
        if (!!item?.fields) {
          item.fields[1].value = value
        }
        await op.updateItem(vaultId, item)
      } else {
        const newItem = new ItemBuilder()
          .setTitle(itemTitle)
          .setCategory("API_CREDENTIAL")
          .addField({
            label: itemFieldName,
            value,
          })
          .build()
        await op.createItem(vaultId, newItem)
      }
    },
  }
}

export type { OnePasswordConfiguration as Configuration }
export { createConfigApi, configurationNames }
