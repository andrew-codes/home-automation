import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"

type DeploymentOptions = {
  namespace: string
}
type DeploymentCommand = "restart"

const kubectl = {
  applyToCluster: (content: string): void => {
    throwIfError(
      sh.exec(`echo -n '${content}' | kubectl apply -f -;`, {
        shell: "/bin/bash",
        silent: true,
      }),
    )
  },
  rolloutDeployment: (
    command: DeploymentCommand,
    deploymentName: string,
    options: DeploymentOptions = { namespace: "default" },
  ) => {
    throwIfError(
      sh.exec(
        `kubectl -n ${options.namespace} rollout ${command} deployment ${deploymentName};`,
        { silent: true },
      ),
    )
  },
}

export default kubectl
