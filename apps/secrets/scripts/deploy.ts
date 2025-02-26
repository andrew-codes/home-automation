import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = await kubectl(kubeConfig)

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "dist", "index.jsonnet"),
  )
  const resourceJson = JSON.parse(resources)

  await Promise.all(
    Object.values(resourceJson).map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

  const secretsPath = path.join(__dirname, "..", ".secrets")
  await fs.mkdir(secretsPath, { recursive: true })

  const sshPrivateKey = await configurationApi.get(
    "home-assistant/ssh-key/private",
  )

  await fs.writeFile(
    path.join(secretsPath, "id_rsa"),
    sshPrivateKey.value.replace(/\\n/g, "\n"),
    "utf8",
  )

  await fs.writeFile(
    path.join(secretsPath, "config"),
    `Host * \
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null`,
    "utf8",
  )

  sh.exec(`kubectl delete secret ssh;`, { silent: true })
  await kube.exec(
    `kubectl create secret generic ssh --from-file=${path.join(
      __dirname,
      "..",
      ".secrets",
      "id_rsa",
    )} --from-file=${path.join(secretsPath, ".kube", "config")};`,
  )
}

export default run
