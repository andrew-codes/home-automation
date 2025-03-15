import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const packagedPath = path.join(__dirname, "..", "._packaged")
  const distPath = path.join(__dirname, "..", "._dist")
  const backups = JSON.parse(
    (await configurationApi.get("backup/config")).value ?? "[]",
  )
  for (const backup of backups) {
    const { ip, username, os } = backup
    if (!ip || !username) {
      throw new Error(
        "Invalid backup configuration: requires an ip and username",
      )
    }

    const userPackagedPath = path.join(packagedPath, ip, username)
    const userDistPath = path.join(distPath, ip, username)
    await fs.mkdir(userPackagedPath, { recursive: true })
    if (os.toLowerCase() === "macos") {
      await fs.cp(
        path.join(userDistPath, "com.user.backup.plist"),
        path.join(userPackagedPath, "com.user.backup.plist"),
        {
          force: true,
        },
      )
      await throwIfError(
        sh.exec(
          `platypus -y -a "Backup" -o "None" -i "${path.join(__dirname, "../src/icon.icns")}" -I "com.user.backup" -V "1.0" -u "Smith-Simms.family" -p "/bin/bash" --bundled-file "${path.join(__dirname, "../src/excludes.txt")}|${path.join(__dirname, "../.secrets/nas_rsa")}" "${userDistPath}/backup.sh" "${userPackagedPath}/Backup.app"`,
        ),
      )
    } else if (os.toLowerCase() === "windows") {
      await throwIfError(
        sh.exec(`cp -R "${userDistPath}/" "${userPackagedPath}/"`),
      )
    }
  }
}

export default run
