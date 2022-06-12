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
  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  const knownHosts = await configurationApi.get("known-hosts")
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "known_hosts"),
    knownHosts,
    "utf8",
  )
  const sshPrivateKey = await configurationApi.get(
    "home-assistant/ssh-key/private",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "id_rsa"),
    sshPrivateKey,
    "utf8",
  )

  sh.exec(`kubectl delete secret ssh;`, { silent: true })
  throwIfError(
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
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "dist", "index.jsonnet"),
  )
  const resourceJson = JSON.parse(resources)
  Object.values(resourceJson).forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })
}

export default run
