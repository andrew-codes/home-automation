import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import { writeFileSync } from "fs"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import { v4 as uuidv4 } from "uuid"

type DeploymentOptions = {
  namespace: string
}
type DeploymentCommand = "restart"

const kubectl = (kubeConfig: string) => {
  let kubeConfigPath = path.join(__dirname, "..", ".secrets")
  sh.mkdir("-p", kubeConfigPath)
  kubeConfigPath = path.join(kubeConfigPath, "config")
  writeFileSync(kubeConfigPath, kubeConfig.replace(/\\n/g, "\n"), "utf8")

  return {
    applyToCluster: async (content: string): Promise<void> => {
      const fileName = uuidv4()
      try {
        await fs.mkdir("/tmp")
      } catch (e) {}
      await fs.writeFile(path.join("/tmp", fileName), content)
      sh.env["KUBECONFIG"] = kubeConfigPath
      await throwIfError(
        sh.exec(
          `KUBECONFIG=${kubeConfigPath} kubectl apply --namespace default -f /tmp/${fileName};`,
          {
            shell: "/bin/bash",
            silent: false,
          },
        ),
      )
      await fs.unlink(path.join("/tmp", fileName))
    },
    patch: async (
      name: string,
      resourceType: string,
      namespace: string,
      content: string,
    ): Promise<void> => {
      sh.env["KUBECONFIG"] = kubeConfigPath
      await throwIfError(
        sh.exec(
          `KUBECONFIG=${kubeConfigPath} kubectl patch ${resourceType} --namespace ${namespace} ${name} --patch="$(echo -n '${content}' | sed 's/"/\\"/g')";`,
          {
            shell: "/bin/bash",
            silent: true,
          },
        ),
      )
    },
    rolloutDeployment: async (
      command: DeploymentCommand,
      deploymentName: string,
      options: DeploymentOptions = { namespace: "default" },
    ): Promise<void> => {
      sh.env["KUBECONFIG"] = kubeConfigPath
      await throwIfError(
        sh.exec(
          `KUBECONFIG=${kubeConfigPath} kubectl -n ${options.namespace} rollout ${command} deployment ${deploymentName};`,
          { shell: "/bin/bash", silent: true },
        ),
      )
    },
    exec: async (command: string): Promise<string> => {
      sh.env["KUBECONFIG"] = kubeConfigPath
      return throwIfError(
        sh.exec(`KUBECONFIG=${kubeConfigPath} ${command}`, {
          shell: "/bin/bash",
          silent: true,
        }),
      )
    },
    [Symbol.dispose]: () => {
      logger.debug(`Cleaning up kubeconfig`)
      sh.rm(kubeConfigPath)
      sh.env["KUBECONFIG"] = ""
    },
  }
}

export default kubectl
