import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = await configurationApi.get("pihole/ip")
  const password = await configurationApi.get("pihole/password")
  const sshPublicKey = await configurationApi.get(
    "home-assistant/ssh-key/public",
  )

  sh.mkdir(".secrets", { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "users.env"),
    `
---
pihole_password: "${password.value}"`,
    "utf8",
  )
  const hostsPath = path.join(__dirname, "..", ".secrets", "hosts.yml")
  await fs.writeFile(
    hostsPath,
    `
    all:
      vars:
        ansible_user: root
      hosts:
        ${ip.value}:`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ha.pub"),
    `${sshPublicKey.value}`,
    "utf8",
  )
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  await throwIfError(
    sh.exec(
      `ansible-playbook ${path.join(
        __dirname,
        "..",
        "deployment",
        "index.yml",
      )} -i ${hostsPath};`,
      {
        silent: true,
      },
    ),
  )
}

export default run
