import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "dist", "index.jsonnet"),
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    Object.values(resourceJson).map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  const sshPrivateKey = await configurationApi.get(
    "home-assistant/ssh-key/private",
  )

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "id_rsa"),
    sshPrivateKey.value.replace(/\\n/g, "\n"),
    "utf8",
  )

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "config"),
    `Host * \
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null`,
    "utf8",
  )

  sh.exec(`kubectl delete secret ssh;`, { silent: true })
  await throwIfError(
    sh.exec(
      `kubectl create secret generic ssh --from-file=${path.join(
        __dirname,
        "..",
        ".secrets",
        "id_rsa",
      )} --from-file=${path.join(__dirname, "..", ".secrets", "config")};`,
      { silent: true },
    ),
  )
}

export default run
