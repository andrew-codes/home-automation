import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  const ip = await configurationApi.get("docker-registry/ip")
  const name = await configurationApi.get("docker-registry/name")
  const machineUsername = await configurationApi.get(
    "docker-registry/machine/username",
  )
  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: ${machineUsername.value}
    hostname: "${name.value}"
  hosts:
    ${ip.value}:
`,
    "utf8",
  )

  const auth = sh.exec(
    `docker run --entrypoint htpasswd httpd:2 -Bbn ${username.value} ${password.value}`,
  ).stdout
  await fs.writeFile(path.join(__dirname, "..", ".secrets", "htpasswd"), "utf8")

  await throwIfError(
    sh.exec(
      `ansible-playbook ${path.join(
        __dirname,
        "..",
        "deployment",
        "deploy.yml",
      )} -i ${path.join(__dirname, "..", ".secrets", "hosts.yml")};`,
      { silent: true },
    ),
  )
}

export default run
