import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = await configurationApi.get("proxy/ip")
  const certEmail = await configurationApi.get("proxy/ddns/cert-email")
  const dnsCredentials = await configurationApi.get(
    "proxy/ddns/service-account/credentials-json",
  )
  const sshPublicKey = await configurationApi.get(
    "home-assistant/ssh-key/public",
  )

  throwIfError(
    sh.exec(`mkdir -p ${path.join(__dirname, "..", ".secrets")};`, {
      silent: true,
    }),
  )

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    `---
cert_email: "${certEmail}"`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
    all:
      vars:
        ansible_user: root
      hosts:
        ${ip}:`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "google.json"),
    `${dnsCredentials}`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ha.pub"),
    `${sshPublicKey}`,
    "utf8",
  )
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  sh.exec(
    `ansible-playbook ${path.join(
      __dirname,
      "..",
      "deployment",
      "index.yml",
    )} -i ${path.join(__dirname, "..", ".secrets", "hosts.yml")}`,
    { silent: true },
  )
}

export default run
