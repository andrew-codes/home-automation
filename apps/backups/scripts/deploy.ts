import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import Handlebars from "handlebars"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const backups = JSON.parse(
    (await configurationApi.get("backup/config")).value ?? "[]",
  )

  for (const backup of backups) {
    const backupShTemplateContents = await fs.readFile(
      path.join(__dirname, "..", "src", "backup.sh.mustache"),
      "utf8",
    )
    const backupShTemplate = Handlebars.compile(backupShTemplateContents)
    const { ip, username, password, isWindows, profileName } = backup
    logger.info(`Deploying backup for ${username} on ${ip}`)
    if (!ip || !username) {
      logger.error(
        "Invalid backup configuration: requires an ip and username",
        backup,
      )
      continue
    }

    const secretsPath = path.join(__dirname, "..", ".secrets")
    const backupPath = path.join(secretsPath, ip, username)
    await fs.mkdir(backupPath, { recursive: true })

    if (!isWindows) {
      const backupSh = backupShTemplate({
        ansibleUser: profileName ?? username,
      })
      await fs.writeFile(path.join(backupPath, "backup.sh"), backupSh, "utf8")
      const plistTemplateContents = await fs.readFile(
        path.join(__dirname, "..", "src", "com.user.backup.plist.mustache"),
        "utf8",
      )
      const plistTemplate = Handlebars.compile(plistTemplateContents)
      const plist = plistTemplate({
        ansibleUser: username,
      })
      await fs.writeFile(
        path.join(backupPath, "com.user.backup.plist"),
        plist,
        "utf8",
      )

      let playbookPath = path.join(
        __dirname,
        "..",
        "src",
        "deployment",
        `${isWindows ? "windows" : "osx"}_deploy.yml`,
      )
      await runPlaybook(
        playbookPath,
        [ip],
        {
          ansibleUser: username,
        },
        path.join(secretsPath, "ssh-key"),
      )
    } else {
      const backupShWindowsContents = await fs.readFile(
        path.join(__dirname, "..", "src", "backup.sh.windows.mustache"),
        "utf8",
      )
      const backupShWindowsTemplate = Handlebars.compile(
        backupShWindowsContents,
      )
      const backupSh = backupShWindowsTemplate({
        ansibleUser: profileName ?? username,
      })
      await fs.writeFile(path.join(backupPath, "backup.sh"), backupSh, "utf8")

      const batContents = await fs.readFile(
        path.join(__dirname, "..", "src", "backup.bat.mustache"),
        "utf8",
      )
      const batTemplate = Handlebars.compile(batContents)
      const bat = batTemplate({
        ansibleUser: profileName ?? username,
      })
      await fs.writeFile(path.join(backupPath, "backup.bat"), bat, "utf8")

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
          )} --extra-vars "ansible_become_pass='${password}'" --extra-vars "profileName='${profileName ?? username}'";`,
          {
            silent: false,
          },
        ),
      )
    }
  }
}

export default run
