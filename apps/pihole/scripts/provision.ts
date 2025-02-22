import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  console.log("Provisioning Piholes with Terraform")
  let TF_VAR_ip = await configurationApi.get("pihole/ip")
  let ip2 = await configurationApi.get("pihole2/ip")
  const TF_VAR_gateway = await configurationApi.get("unifi/ip")
  const pveHost = await configurationApi.get("proxmox/host/pve")
  const TF_VAR_pm_username = await configurationApi.get("proxmox/username")
  const TF_VAR_pm_password = await configurationApi.get("proxmox/password")
  const TF_VAR_hostname = await configurationApi.get("pihole/hostname")
  const TF_VAR_ssh_key = await configurationApi.get("proxmox/ssh-key/public")

  sh.env["TF_VAR_ip"] = `${TF_VAR_ip.value}/8`
  sh.env["TF_VAR_ip2"] = `${ip2.value}/8`
  sh.env["TF_VAR_gateway"] = TF_VAR_gateway.value
  sh.env["TF_VAR_pm_api_url"] = `https://${pveHost.value}/api2/json`
  sh.env["TF_VAR_pm_password"] = TF_VAR_pm_password.value
  sh.env["TF_VAR_pm_username"] = TF_VAR_pm_username.value
  sh.env["TF_VAR_hostname"] = TF_VAR_hostname.value
  sh.env["TF_VAR_hostname2"] = `${TF_VAR_hostname.value}2`
  sh.env["TF_VAR_ssh_key"] = TF_VAR_ssh_key.value
  sh.env["TF_VAR_nameserver"] = "1.1.1.1"

  const terraformProcess = sh.exec(
    `terraform init --upgrade && terraform plan --out=tfplan && terraform apply "tfplan"`,
    { silent: false },
  )
  await throwIfError(terraformProcess)

  TF_VAR_ip = await configurationApi.get("pihole2/ip")

  sh.env["TF_VAR_ip"] = `${TF_VAR_ip.value}/8`

  const terraformProcess2 = sh.exec(
    `terraform init --upgrade && terraform plan --out=tfplan && terraform apply "tfplan"`,
    { silent: false },
  )
  await throwIfError(terraformProcess2)
}

export default run
