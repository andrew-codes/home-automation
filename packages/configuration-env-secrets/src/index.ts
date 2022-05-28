import { ConfigurationApi } from "@ha/configuration-api"
import { config } from "dotenv"
import path from "path"

type Configuration = {
  azureKeyVaultName: string
  azureSubscriptionId: string
  azureTenantId: string
  azureClientId: string
  azureClientSecret: string
}

const configurationApi: ConfigurationApi<Configuration> = {
  get: async (name) => {
    const { parsed } = config({
      path: path.join(__dirname, "..", "..", "..", ".secrets.env"),
    })

    return (parsed as unknown as Configuration)[name]
  },
}

export type { Configuration }
export { configurationApi }
