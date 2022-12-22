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

  const knownHosts = await configurationApi.get("known-hosts")
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "known_hosts"),
    knownHosts.value,
    "utf8",
  )
  const sshPrivateKey = await configurationApi.get(
    "home-assistant/ssh-key/private",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "id_rsa"),
    sshPrivateKey.value.replace("\\n", "\n"),
    "utf8",
  )

  sh.exec(`kubectl delete secret ssh;`, { silent: true })
  await throwIfError(
    sh.exec(
      `kubectl create secret generic ssh --from-file=${path.join(
        __dirname,
        "..",
        ".secrets",
        "known_hosts",
      )} --from-file=${path.join(__dirname, "..", ".secrets", "id_rsa")};`,
      { silent: true },
    ),
  )
}

export default run
