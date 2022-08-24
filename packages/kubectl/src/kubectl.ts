import path from "path"
import sh from "shelljs"
import { safeCliString } from "@ha/cli-utils"
import { throwIfError } from "@ha/shell-utils"

type DeploymentOptions = {
  namespace: string
}
type DeploymentCommand = "restart"

const kubectl = {
  applyToCluster: (content: string): void => {
    throwIfError(
      sh.exec(`echo -n '${safeCliString(content)}' | kubectl apply -f -;`, {
        shell: "/usr/bin/bash",
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
      ),
    )
  },
}

export default kubectl
