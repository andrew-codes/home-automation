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
  const ip = await configurationApi.get("openvpn/ip")
  const usernames = await configurationApi.get("openvpn/usernames")
  const passwords = await configurationApi.get("openvpn/passwords")

  throwIfError(sh.exec(`mkdir -p ${path.join(__dirname, "..", ".secrets")}`))
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "users.env"),
    `
passwords="${passwords.value}"
usernames="${usernames.value}"`,
    "utf8",
  )
  const hostsPath = path.join(__dirname, "..", ".secrets", "hosts.yml")
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

  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  throwIfError(
    sh.exec(
      `ansible-playbook ${path.join(
        __dirname,
        "..",
        "deployment",
        "index.yml",
      )} -i ${hostsPath};`,
      {
        silent: true,
      },
    ),
  )

  const githubToken = await configurationApi.get("github/token")
  const client = await createCodeSpaceSecretClient(githubToken.value, [
    "317289870",
  ] as never[])

  const codespaceOvpn = await fs.readFile(
    path.join(__dirname, "..", ".secrets", "codespaces.ovpn"),
    "utf8",
  )
  await client.set("OPENVPN_CONFIG", codespaceOvpn)

  const codespaceUsernameIndex = usernames.value
    .split(",")
    .findIndex((username) => username === "codespaces")
  if (codespaceUsernameIndex >= 0) {
    await client.set(
      "VPN_CREDS",
      `codespaces\n${passwords.value.split(",")[codespaceUsernameIndex]}`,
    )
  }
}

export default run
