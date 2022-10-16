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
  const ip = await configurationApi.get("docker/registry/ip")
  const k8sName = await configurationApi.get("docker/registry/name")
  const k8sUsername = await configurationApi.get("docker/registry/machine/username")
  const machinePassword = await configurationApi.get("docker/registry/machine/password")

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: ${k8sUsername}
    hostname: "${k8sName}"
  hosts:
    ${ip}:
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
      )} --extra-vars "ansible_become_pass='${machinePassword}'";`,
      { silent: true },
    ),
  )
}

export default run
