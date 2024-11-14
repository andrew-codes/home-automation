import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  // https://github.com/AliyunContainerService/gpushare-scheduler-extender/blob/master/docs/install.md
  sh.exec(
    `kubectl create -f ${path.join(
      __dirname,
      "..",
      "deployment",
      "index.yaml",
    )}`,
  )
}

export default run
