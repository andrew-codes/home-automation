import type { ConfigurationApi } from "@ha/configuration-api"
import { configurationApi as staticConfiguration } from "@ha/configuration-static"
import { createConfigApi as createAzureKvConfiguration } from "@ha/configuration-azure-kv"
import { uniq } from "lodash"
import type { Configuration } from "./Configuration.types"
import createDebugger from "debug"

const debug = createDebugger("@ha/configuration-workspace/index")

const createConfigurationApi = async (
  providers: ConfigurationApi<any>[] = [staticConfiguration],
): Promise<ConfigurationApi<Configuration>> => {
  const akvConfigurationApi = await createAzureKvConfiguration()
  const configurationProviders = providers.concat(akvConfigurationApi)

  return {
    get: async (name) => {
      for (const configurationProvider of configurationProviders) {
        try {
          const value = await configurationProvider.get(name)
          return value
        } catch (error) {
          debug(error)
        }
      }
      throw new Error(`Configuration value not found, ${name}.`)
    },
    getNames: () => {
      const allConfiguration = configurationProviders.reduce(
        (acc, provider) => acc.concat(provider.getNames()),
        [],
      )

      return uniq(allConfiguration)
    },
    set: async (name, value) => {},
  }
}

export { createConfigurationApi }
export type { Configuration }