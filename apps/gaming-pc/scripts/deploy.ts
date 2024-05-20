import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  const ip = await configurationApi.get("gaming-pc/ip")
  const user = await configurationApi.get("gaming-pc/user")
  const username = await configurationApi.get("gaming-pc/machine/username")
  const password = await configurationApi.get("gaming-pc/machine/password")
  const haSshPub = await configurationApi.get("home-assistant/ssh-key/public")
  const devSshPub = await configurationApi.get("dev/ssh-key/public")

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `sll:
  vars:
    ansible_user: ${username.value}
    ansible_password: ${password.value}
    ansible_winrm_server_cert_validation: ignore
    ansible_port: 5986
    ansible_winrm_transport: basic
  hosts:
    ${ip.value}:
`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    `---
user: ${user.value.replace(/ /g, "/ ")}
`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "authorized_keys"),
    `${haSshPub.value}
${devSshPub.value}`,
    "utf8",
  )

  await throwIfError(
    sh.exec(
      `ansible-playbook ${path.join(
        __dirname,
        "..",
        "deployment",
        "deploy.yml",
      )} -i ${path.join(
        __dirname,
        "..",
        ".secrets",
        "hosts.yml",
      )} --extra-vars "ansible_become_pass='${password.value}'";`,
      { silent: true },
    ),
  )
}

export default run
