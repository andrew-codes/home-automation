import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { createCodeSpaceSecretClient } from "@ha/github-secrets"
import { throwIfError } from "@ha/shell-utils"
import { existsSync } from "fs"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
  const ip = await configurationApi.get("k8s/main-node/ip")
  const k8sName = await configurationApi.get("k8s/name")
  const k8sUsername = await configurationApi.get("k8s/machine/username")
  const networkCIDR = await configurationApi.get("k8s/pod-network-cidr")
  const machinePassword = await configurationApi.get("k8s/machine/password")

  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })

  if (!existsSync(path.join(__dirname, "..", ".secrets", "hosts.yml"))) {
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: ${k8sUsername.value}
  children:
    main:
      hosts:
        ${ip.value}:
          hostname: "${k8sName.value}"
    workers:
      hosts:
`,
    "utf8",
  )
  }
  
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    `---
pod_network_cidr: "${networkCIDR.value}"
`,
    "utf8",
  )

  await throwIfError(
    sh.exec(
      `ansible-playbook ${path.join(
        __dirname,
        "..",
        "deployment",
        "deploy.yml",
      )} -i ${path.join(
        __dirname,
        "..",
        ".secrets",
        "hosts.yml",
      )} --extra-vars "ansible_become_pass='${machinePassword.value}'";`,
      { silent: true },
    ),
  )

  const kubeConfigPath = path.join(
    __dirname,
    "..",
    ".secrets",
    ".kube",
    "config",
  )
  const kubeConfig = await fs.readFile(kubeConfigPath, "utf8")

  const githubToken = await configurationApi.get("github/token")
  const client = await createCodeSpaceSecretClient(githubToken.value, [
    "317289870",
  ] as never[])
  await client.set("K8S_CONFIG", kubeConfig)

  sh.env["KUBECONFIG"] = kubeConfigPath
  await throwIfError(sh.exec(`kubectl create sa app;`, { silent: true }))
}

export default run
