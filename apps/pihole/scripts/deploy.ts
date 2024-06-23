import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = await configurationApi.get("pihole/ip")
  const password = await configurationApi.get("pihole/password")

  try {
    const sshPublicKey = await configurationApi.get(
      "home-assistant/ssh-key/public",
    )

    sh.mkdir(".secrets", { recursive: true })
    await fs.writeFile(
      path.join(__dirname, "..", ".secrets", "users.env"),
      `
---
pihole_password: "${password.value}"`,
      "utf8",
    )
    const hostsPath = path.join(__dirname, "..", ".secrets", "hosts.yml")
    await fs.writeFile(
      hostsPath,
      `
all:
  vars:
    ansible_user: root
  hosts:
    ${ip.value}:`,
      "utf8",
    )
    await fs.writeFile(
      path.join(__dirname, "..", ".secrets", "ha.pub"),
      `${sshPublicKey.value}`,
      "utf8",
    )
    sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
    sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
    await throwIfError(
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
  } catch (error) {
    console.error(error)
  }

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "service.jsonnet"),
    {
      ip1: ip.value,
      ip2: await (await configurationApi.get("pihole2/ip")).value,
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )
}

export default run
