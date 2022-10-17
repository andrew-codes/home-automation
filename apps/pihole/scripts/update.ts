import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = await configurationApi.get("pihole/ip")

  await fs.mkdir(".secrets", { recursive: true })
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
    sh.exec(`ansible-playbook deployment/update.yml -i .secrets/hosts.yml;`),
  )
}

export default run
