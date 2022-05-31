import path from "path"
import sh from "shelljs"
import { safeCliString } from "@ha/cli-utils"

const kubectl = {
  applyToCluster: (content: string): void => {
    sh.exec(`echo -n ${safeCliString(JSON.stringify(content))} | kubectl apply -f -`)
  },
}

export default kubectl
