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
  const ipInternal = await configurationApi.get("proxy-internal/ip")
  const certEmail = await configurationApi.get("proxy/ddns/cert-email")
  const dnsCredentials = await configurationApi.get(
    "proxy/ddns/service-account/credentials-json",
  )
  const sshPublicKey = await configurationApi.get(
    "home-assistant/ssh-key/public",
  )

  await throwIfError(
    sh.exec(`mkdir -p ${path.join(__dirname, "..", ".secrets")};`, {
      silent: true,
    }),
  )

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    `---
cert_email: "${certEmail.value}"`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: root
  hosts:
    ${ip.value}:`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts-internal.yml"),
    `
all:
  vars:
    ansible_user: root
  hosts:
    ${ipInternal.value}:`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "creds.ini"),
    `${dnsCredentials.value}`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ha.pub"),
    `${sshPublicKey.value}`,
    "utf8",
  )

  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  sh.exec(
    `ansible-playbook ${path.join(
      __dirname,
      "..",
      "deployment",
      "index.yml",
    )} -i ${path.join(
      __dirname,
      "..",
      ".secrets",
      "hosts.yml",
    )} --extra-vars "nginxDir='proxy'"`,
    { silent: true },
  )

  sh.exec(
    `ansible-playbook ${path.join(
      __dirname,
      "..",
      "deployment",
      "index.yml",
    )} -i ${path.join(
      __dirname,
      "..",
      ".secrets",
      "hosts-internal.yml",
    )} --extra-vars "nginxDir='proxy-internal'"`,
    { silent: true },
  )
}

export default run
