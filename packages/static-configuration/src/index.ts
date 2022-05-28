import { Configuration } from "./Configuration.types"
import { ConfigurationApi } from "./ConfigurationApi.types"

const createConfigurationApi = async (): Promise<
  ConfigurationApi<Configuration>
> => {
  return {
    get: async (name) => {
      console.log(name)
      return name
    },
  }
  throw new Error("Not implemented")
}

export { createConfigurationApi }
export type { ConfigurationApi }
