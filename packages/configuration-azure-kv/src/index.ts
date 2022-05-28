import { ConfigurationApi } from "@ha/configuration-api"

type AzureKvConfiguration = {}

const configurationMap: AzureKvConfiguration = {}

const configurationApi: ConfigurationApi<AzureKvConfiguration> = {
  get: async (name) => configurationMap[name],
}

export type { AzureKvConfiguration as Configuration }
export { configurationApi }
