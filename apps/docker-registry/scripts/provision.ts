import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import * as terraform from "@ha/terraform"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = (await configurationApi.get("docker-registry/ip")).value
  const hostname = (await configurationApi.get("docker-registry/name")).value
  const gateway = (await configurationApi.get("unifi/ip")).value
  const pveHost = (await configurationApi.get("proxmox/host/pve")).value
  const pmUsername = (await configurationApi.get("proxmox/username")).value
  const pmPassword = (await configurationApi.get("proxmox/password")).value
  const proxmoxSshKey = (await configurationApi.get("proxmox/ssh-key/public"))
    .value
  const devSshKey = (await configurationApi.get("dev/ssh-key/public")).value
  const sshKey = [proxmoxSshKey, devSshKey].join("\n")
  const nameserver = (await configurationApi.get("proxmox/nameserver")).value

  const vmId = ip.split(".").slice(1).join("")

  await terraform.apply(
    {
      ip: `${ip}/8`,
      gateway,
      pmApiUrl: `https://${pveHost}/api2/json`,
      pmUsername: pmUsername,
      pmPassword,
      hostname,
      sshKey,
      nameserver,
      vmId,
    },
    path.join(__dirname, "..", "src", "provision"),
    path.join(__dirname, "..", ".terraform"),
  )

  const proxmoxIp = (await configurationApi.get("proxmox/ip")).value
  await runPlaybook(
    path.join(__dirname, "..", "src", "provision", "provision.yml"),
    [proxmoxIp],
    {
      vmId,
    },
  )
}

export default run
