import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretsPath = path.join(__dirname, "..", ".secrets")
  await fs.mkdir(secretsPath, { recursive: true })

  const sshKey = (await configurationApi.get("backup/ssh-key/private")).value
  const sshKeyPublic = (await configurationApi.get("backup/ssh-key/public"))
    .value
  const nasKey = (await configurationApi.get("backup/nas/ssh-key/private"))
    .value
  if (!sshKey || !sshKeyPublic || !nasKey) {
    throw new Error("SSH key not found")
  }

  const sshKeyPath = path.join(secretsPath, "ssh-key")
  await fs.writeFile(sshKeyPath, sshKey.replace(/\\n/g, "\n"), {
    encoding: "utf8",
    mode: 0o600,
  })
  await fs.writeFile(sshKeyPath + ".pub", sshKeyPublic, {
    encoding: "utf8",
    mode: 0o644,
  })
  await fs.writeFile(
    path.join(secretsPath, "nas_rsa"),
    nasKey.replace(/\\n/g, "\n"),
    {
      encoding: "utf8",
      mode: 0o600,
    },
  )
}

export default run
