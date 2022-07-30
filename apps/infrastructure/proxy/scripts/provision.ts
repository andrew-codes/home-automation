import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const TF_VAR_ip = await configurationApi.get("proxy/ip")
  const TF_VAR_gateway = await configurationApi.get("unifi/ip")
  const pveHost = await configurationApi.get("proxmox/host/pve")
  const TF_VAR_pm_username = await configurationApi.get("proxmox/username")
  const TF_VAR_pm_password = await configurationApi.get("proxmox/password")
  const TF_VAR_hostname = await configurationApi.get("proxy/hostname")
  const TF_VAR_ssh_key = await configurationApi.get("proxmox/ssh-key/public")
  const TF_VAR_nameserver = await configurationApi.get("proxmox/nameserver")

  sh.env["TF_VAR_ip"] = `${TF_VAR_ip}/8`
  sh.env["TF_VAR_gateway"] = TF_VAR_gateway
  sh.env["TF_VAR_pm_api_url"] = `https://${pveHost}/api2/json`
  sh.env["TF_VAR_pm_password"] = TF_VAR_pm_password
  sh.env["TF_VAR_pm_username"] = TF_VAR_pm_username
  sh.env["TF_VAR_hostname"] = TF_VAR_hostname
  sh.env["TF_VAR_ssh_key"] = TF_VAR_ssh_key
  sh.env["TF_VAR_nameserver"] = TF_VAR_nameserver
  const terraformProcess = sh.exec(
    `terraform init && terraform plan && terraform apply --auto-approve;`,
    { silent: true },
  )
  throwIfError(terraformProcess)
}

export default run
