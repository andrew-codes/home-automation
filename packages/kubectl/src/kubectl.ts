import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"

type DeploymentOptions = {
  namespace: string
}
type DeploymentCommand = "restart"

const kubectl = {
  applyToCluster: async (content: string): Promise<void> => {
    await throwIfError(
      sh.exec(`echo -n '${content}' | kubectl apply -f -;`, {
        shell: "/bin/bash",
        silent: true,
      }),
    )
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
