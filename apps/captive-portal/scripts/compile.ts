import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import sh from 'shelljs'

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  sh.exec('tsc -b')
  sh.exec('remix build')
}

export default run
