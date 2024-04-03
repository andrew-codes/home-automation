import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import { v4 as uuidv4 } from "uuid"

type DeploymentOptions = {
  namespace: string
}
type DeploymentCommand = "restart"

const kubectl = {
  applyToCluster: async (content: string): Promise<void> => {
    const fileName = uuidv4()
    try {
      await fs.mkdir("/tmp")
    } catch (e) {}
    await fs.writeFile(path.join("/tmp", fileName), content)
    await throwIfError(
      sh.exec(`kubectl apply -f /tmp/${fileName};`, {
        shell: "/bin/bash",
        silent: false,
      }),
    )
    await fs.unlink(path.join("/tmp", fileName))
  },
  patch: async (
    name: string,
    resourceType: string,
    namespace: string,
    content: string,
  ): Promise<void> => {
    await throwIfError(
      sh.exec(
        `kubectl patch ${resourceType} --namespace ${namespace} ${name} --patch="$(echo -n '${content}' | sed 's/"/\\"/g')";`,
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
    await throwIfError(
      sh.exec(
        `kubectl -n ${options.namespace} rollout ${command} deployment ${deploymentName};`,
        { silent: true },
      ),
    )
  },
}

export default kubectl
