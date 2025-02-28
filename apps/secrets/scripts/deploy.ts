import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { logger } from "@ha/logger"
import fs from "fs/promises"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = await kubectl(kubeConfig)

  const secretsPath = path.join(__dirname, "..", ".secrets")
  await fs.mkdir(secretsPath, { recursive: true })
  const credentials = (await configurationApi.get("onepassword/credentials"))
    .value
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "1password-credentials.json"),
    credentials.replace(/\\n/g, "\n"),
    "utf8",
  )

  const token = (await configurationApi.get("onepassword/token/connect")).value
  try {
    await kube.exec(
      `helm install connect 1password/connect --set-file connect.credentials=.secrets/1password-credentials.json --set operator.create=true --set operator.token.value=${token}`,
    )
  } catch (e) {
    logger.warn("1password connect may already be installed.")
    if (!e?.message.includes("re-use a name")) {
      throw new Error("Failed to install 1password connect.")
    }
  }

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", ".secrets", "index.jsonnet"),
  )
  const resourceJson = JSON.parse(resources)

  await Promise.all(
    Object.values(resourceJson).map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

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
    `
Host *
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null`,
    "utf8",
  )

  try {
    await kube.exec(`kubectl delete secret ssh;`)
  } catch (e) {
    logger.warn("ssh secret may not exist.")
  }
  await fs.writeFile(path.join(secretsPath, "config"), kubeConfig, "utf8")

  await kube.exec(
    `kubectl create secret generic ssh --from-file=${path.join(
      __dirname,
      "..",
      ".secrets",
      "id_rsa",
    )} --from-file=${path.join(secretsPath, "config")};`,
  )
}

export default run
