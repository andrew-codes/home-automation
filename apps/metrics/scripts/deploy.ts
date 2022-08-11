import sh from 'shelljs'
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"

const run = async (
    configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
    sh.exec(`kubectl create -f deployment;`)
}

export default run
