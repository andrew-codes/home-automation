import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "./Configuration.types"

const createConfigurationApi = async (): Promise<
  ConfigurationApi<Configuration>
> => {
  throw new Error("Not implemented")
}

export { createConfigurationApi }
export type { Configuration }
