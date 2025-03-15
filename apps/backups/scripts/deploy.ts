import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const backups = JSON.parse(
    (await configurationApi.get("backup/config")).value ?? "[]",
  )

  const secretsPath = path.join(__dirname, "..", ".secrets")
  const artifactsPath = path.join(__dirname, "..", "._packaged")
  for (const backup of backups) {
    const { ip, username, password, os, profileName } = backup
    logger.info(`Deploying backup for ${username} on ${ip}`)
    if (!ip || !username || !os) {
      throw new Error(
        "Invalid backup configuration: requires an ip, username and os",
      )
    }

    const artifactPath = path.join(artifactsPath, ip, username)
    const backupPath = path.join(secretsPath, ip, username)

    if (os.toLowerCase() === "macos") {
      let playbookPath = path.join(
        __dirname,
        "..",
        "src",
        "deployment",
        `osx_deploy.yml`,
      )
      await runPlaybook(
        playbookPath,
        [ip],
        {
          ansibleUser: username,
          artifactPath,
        },
        path.join(secretsPath, "ssh-key"),
      )
    } else {
      await fs.writeFile(
        path.join(secretsPath, "windows.yml"),
        `
all:
  vars:
    ansible_user: ${username}
    ansible_password: ${password}
    ansible_become_password: ${password}
    ansible_winrm_server_cert_validation: ignore
    ansible_port: 5986
    ansible_winrm_transport: basic
  hosts:
    ${ip}:
      `,
        "utf8",
      )
      sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
      await throwIfError(
        sh.exec(
          `ansible-playbook ${path.join(
            __dirname,
            "..",
            "src",
            "deployment",
            "windows_deploy.yml",
          )} -i ${path.join(
            secretsPath,
            "windows.yml",
          )} --extra-vars "ansible_become_pass='${password}'" --extra-vars "profileName='${profileName ?? username}'" --extra-vars "artifactPath='${path.join(artifactPath)}'";`,
          {
            silent: false,
          },
        ),
      )
    }
  }
}

export default run
