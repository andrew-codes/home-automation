import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  const ip = await configurationApi.get("remote-codespaces/ip")
  const machineName = await configurationApi.get("remote-codespaces/name")
  const machineUsername = await configurationApi.get(
    "remote-codespaces/machine/username",
  )
  const machinePassword = await configurationApi.get(
    "remote-codespaces/machine/password",
  )

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: ${machineUsername.value}
    hostname: ${machineName.value}
  hosts:
    ${ip.value}:
`,
    "utf8",
  )

  throwIfError(
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
      )} --extra-vars "ansible_become_pass='${machinePassword.value}'";`,
      { silent: true },
    ),
  )
}

export default run
