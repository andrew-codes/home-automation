import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const backups = JSON.parse(
    (await configurationApi.get("backup/config")).value ?? "[]",
  )

  const secretsPath = path.join(__dirname, "..", ".secrets")
  for (const backup of backups) {
    const { ip, username, os } = backup
    logger.info(`Deploying backup for ${username} on ${ip}`)
    if (!ip || !username || !os) {
      throw new Error(
        "Invalid backup configuration: requires an ip, username and os",
      )
    }

    if (os.toLowerCase() === "macos") {
      let playbookPath = path.join(
        __dirname,
        "..",
        "src",
        "deployment",
        `osx_post_deploy.yml`,
      )
      await runPlaybook(
        playbookPath,
        [ip],
        {
          ansibleUser: username,
        },
        path.join(secretsPath, "ssh-key"),
      )
    }
  }
}

export default run
