import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { image } from "./config"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.exec(
    `docker run -v $PWD:/workspace gcr.io/kaniko-project/executor:latest --dockerfile /workspace/Dockerfile --destination \"${image}:latest\" --context dir:///workspace/ --insecure --cache=true`,
  )
}

export default run
