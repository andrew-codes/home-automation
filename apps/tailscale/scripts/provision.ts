import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"
import * as terraform from "@ha/terraform"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  logger.info("Provisioning Pi-hole")
  const ip1 = (await configurationApi.get("tailscale/ip")).value
  const gateway = (await configurationApi.get("unifi/ip")).value
  const pveHost = (await configurationApi.get("proxmox/host/pve")).value
  const pm_username = (await configurationApi.get("proxmox/username")).value
  const pm_password = (await configurationApi.get("proxmox/password")).value
  const hostname = (await configurationApi.get("tailscale/hostname")).value

  const proxmoxSshKey = (await configurationApi.get("proxmox/ssh-key/public"))
    .value
  const devSshKey = (await configurationApi.get("dev/ssh-key/public")).value
  const haSshKey = (await configurationApi.get("home-assistant/ssh-key/public"))
    .value
  const sshKey = [proxmoxSshKey, devSshKey, haSshKey].join("\n")

  var vars = {
    ip: `${ip1}/8`,
    gateway,
    pm_api_url: `https://${pveHost}/api2/json`,
    pm_username,
    pm_password,
    sshKey,
    hostname: `${hostname}`,
    nameserver: "1.1.1.1",
  }

  await terraform.apply(
    vars,
    path.join(__dirname, "..", "src"),
    path.join(__dirname, "..", ".terraform"),
  )
}

export default run
