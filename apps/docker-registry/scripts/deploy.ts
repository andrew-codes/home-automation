import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfProcessError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  process.env.OBJC_DISABLE_INITIALIZE_FORK_SAFETY = "YES"

  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")
  const email = await configurationApi.get("docker-registry/email")
  const machinePassword = await configurationApi.get(
    "docker-registry/machine/password",
  )

  const secretsContent = `---
  username: ${username}
  password: ${password}
  email: ${email}`
  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    secretsContent,
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
      "deployment",
      "hosts.yml",
    )} --extra-vars "ansible_become_pass='${machinePassword}'"`,
  )
  throwIfProcessError(childProcess)
}

export default run
