import type { ConfigurationApi } from "@ha/configuration-api"
import { configurationApi as envConfiguration } from "@ha/configuration-env-secrets"
import { createConfigApi as createAzureKvConfiguration } from "@ha/configuration-azure-kv"
import { createConfigApi as createOnepasswordConfiguration } from "@ha/configuration-1password"
import { uniq } from "lodash"
import type { Configuration } from "./Configuration.types"
import createDebugger from "debug"

const debug = createDebugger("@ha/configuration-workspace/index")

const createConfigurationApi = async (
  providers: ConfigurationApi<any>[] = [envConfiguration],
): Promise<ConfigurationApi<Configuration>> => {
  const akvConfigurationApi = await createAzureKvConfiguration()
  const onepasswordConfiguration = await createOnepasswordConfiguration()
  const configurationProviders = providers.concat(
    onepasswordConfiguration,
    akvConfigurationApi,
  )

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
      const allConfiguration = configurationProviders.reduce<
        ReadonlyArray<string>
      >(
        (acc, provider) =>
          acc.concat(provider.getNames() as ReadonlyArray<string>),
        [],
      )

      return uniq(allConfiguration)
    },
    set: async (name, value) => {
      await Promise.all(
        configurationProviders
          .filter((provider) => provider.getNames().includes(name))
          .map((provider) => provider.set(name, value)),
      )
    },
  }
}

export { createConfigurationApi }
export type { Configuration }
