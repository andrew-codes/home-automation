import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  process.env.OBJC_DISABLE_INITIALIZE_FORK_SAFETY = "YES"
  const ip = await configurationApi.get("docker-registry/ip")
  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")
  const email = await configurationApi.get("docker-registry/email")
  const machinePassword = await configurationApi.get(
    "docker-registry/machine/password",
  )

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })
  const secretsContent = `---
  username: ${username}
  password: ${password}
  email: ${email}`
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    secretsContent,
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
  const childProcess = sh.exec(
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
    )} --extra-vars "ansible_become_pass='${machinePassword}'"`,
  )
  throwIfError(childProcess)
}

export default run
