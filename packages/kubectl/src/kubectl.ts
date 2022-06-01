import path from "path"
import sh from "shelljs"
import { safeCliString } from "@ha/cli-utils"

type DeploymentOptions = {
  namespace: string
}
type DeploymentCommand = "restart"

const kubectl = {
  applyToCluster: (content: string): void => {
    sh.exec(
      `echo -n ${safeCliString(JSON.stringify(content))} | kubectl apply -f -`,
    )
  },
  rolloutDeployment: (
    command: DeploymentCommand,
    deploymentName: string,
    options: DeploymentOptions = { namespace: "default" },
  ) => {
    sh.exec(`kubectl -n ${options.namespace} rollout ${command} deployment ${deploymentName}`)
  },
}

export default kubectl
