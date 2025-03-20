import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import Handlebars from "handlebars"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const buildPath = path.join(__dirname, "..", "._dist")
  const backups = JSON.parse(
    (await configurationApi.get("backup/config")).value ?? "[]",
  )
  for (const backup of backups) {
    const { ip, username, os, profileName } = backup
    if (!ip || !username || !os) {
      throw new Error(
        "Invalid backup configuration: requires an ip, username, and os",
      )
    }

    const userBuildPath = path.join(buildPath, ip, username)
    await fs.mkdir(userBuildPath, { recursive: true })

    if (os.toLowerCase() === "macos") {
      const backupShTemplateContents = await fs.readFile(
        path.join(__dirname, "..", "src", "backup.sh.mustache"),
        "utf8",
      )
      const backupShTemplate = Handlebars.compile(backupShTemplateContents)
      const backupSh = backupShTemplate({
        ansibleUser: profileName ?? username,
      })
      await fs.writeFile(path.join(userBuildPath, "backup.sh"), backupSh, {
        encoding: "utf8",
        mode: 0o755,
      })

      const plistTemplateContents = await fs.readFile(
        path.join(__dirname, "..", "src", "com.user.backup.plist.mustache"),
        "utf8",
      )
      const plistTemplate = Handlebars.compile(plistTemplateContents)
      const plist = plistTemplate({
        ansibleUser: username,
      })
      await fs.writeFile(
        path.join(userBuildPath, "com.user.backup.plist"),
        plist,
        "utf8",
      )
      const onWakeplistTemplateContents = await fs.readFile(
        path.join(
          __dirname,
          "..",
          "src",
          "com.user.backup.onwake.plist.mustache",
        ),
        "utf8",
      )
      const onWakepListTemplate = Handlebars.compile(
        onWakeplistTemplateContents,
      )
      const onwakepList = onWakepListTemplate({
        ansibleUser: username,
      })
      await fs.writeFile(
        path.join(userBuildPath, "com.user.backup.onwake.plist"),
        onwakepList,
        "utf8",
      )
    } else if (os.toLowerCase() === "windows") {
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
      await fs.writeFile(path.join(userBuildPath, "backup.sh"), backupSh, {
        encoding: "utf8",
        mode: 0o755,
      })

      const batContents = await fs.readFile(
        path.join(__dirname, "..", "src", "backup.bat.mustache"),
        "utf8",
      )
      const batTemplate = Handlebars.compile(batContents)
      const bat = batTemplate({
        ansibleUser: profileName ?? username,
      })
      await fs.writeFile(path.join(userBuildPath, "backup.bat"), bat, {
        encoding: "utf8",
        mode: 0o755,
      })
    }
  }
}

export default run
