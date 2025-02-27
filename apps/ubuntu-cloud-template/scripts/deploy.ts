import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = (await configurationApi.get("proxmox/ip")).value
  const pveHost = (await configurationApi.get("proxmox/host/pve")).value
  const pveUsername = (await configurationApi.get("proxmox/username")).value
  const pvePassword = (await configurationApi.get("proxmox/password")).value
  const becomePassword = (await configurationApi.get("proxmox/password")).value

  throwIfError(sh.exec(`ansible-galaxy collection install community.general`))

  await runPlaybook(path.join(__dirname, "..", "src", "index.yml"), [ip], {
    apiHost: pveHost,
    apiUser: pveUsername.split("!")[0],
    apiTokenId: pveUsername.split("!")[1],
    apiPassword: pvePassword,
    node: "pve",
    ansible_become_password: becomePassword,
    ansible_user: "root",
  })
}

export default run
