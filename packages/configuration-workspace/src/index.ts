import type { ConfigurationApi } from "@ha/configuration-api"
import { staticConfiguration } from "@ha/configuration-static"
import type { Configuration } from "./Configuration.types"
import createDebugger from "debug"

const debug = createDebugger("@ha/configuration-workspace/index")

const createConfigurationApi = async (): Promise<
  ConfigurationApi<Configuration>
> => {
  const configurationProviders = [staticConfiguration]

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
  }
}

export { createConfigurationApi }
export type { Configuration }
