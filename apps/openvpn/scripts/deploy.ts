import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"
import { createCodeSpaceSecretClient } from "@ha/github-secrets"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  throwIfError(sh.exec(`rm -rf .secrets/*.ovpn`))

  const ip = await configurationApi.get("openvpn/ip")
  const usernames = await configurationApi.get("openvpn/usernames")
  const passwords = await configurationApi.get("openvpn/passwords")

  sh.mkdir(".secrets", { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "users.env"),
    `
passwords="${passwords}"
usernames="${usernames}"`,
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

  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  throwIfError(
    sh.exec(`ansible-playbook deployment/index.yml -i .secrets/hosts.yml`),
  )

  const codespaceOvpn = await fs.readFile(
    path.join(__dirname, "..", ".secrets", "codespaces.ovpn"),
    "utf8",
  )

  const githubToken = await configurationApi.get("github/token")
  const client = await createCodeSpaceSecretClient(githubToken, ["317289870"])

  await client.set(
    "OPENVPN_CONFIG",
    `${codespaceOvpn}
auth-user-pass
push-peer-info
route 10.0.0.0 255.0.0.0`,
  )

  const codespaceUsernameIndex = usernames
    .split(",")
    .findIndex((username) => username === "codespaces")
  if (codespaceUsernameIndex >= 0) {
    await client.set(
      "VPN_CREDS",
      `codespaces\n${passwords.split(",")[codespaceUsernameIndex]}`,
    )
  }
}

export default run
