import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = await configurationApi.get("openvpn/ip")
  const usernames = await configurationApi.get("openvpn/usernames")
  const passwords = await configurationApi.get("openvpn/passwords")

  sh.mkdir(".secrets")
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "users.env"),
    `
passwords="${passwords}"
usernames="${usernames}"`,
    "utf8",
  )

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: root
  hosts:
    ${ip}:`,
    "utf8",
  )
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  const deployProcess = sh.exec(
    `ansible-playbook deployment/index.yml -i .secrets/hosts.yml`,
  )
  throwIfError(deployProcess)
}

export default run
