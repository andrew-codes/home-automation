import { ConfigurationApi } from "@ha/configuration-api"
import { config } from "dotenv"
import path from "path"
const configurationNames = [
  "azure/key-vault/name",
  "azure/tenant/id",
  "azure/client/id",
  "azure/client/secret",
] as const

type ConfigurationKeys = typeof configurationNames
type Configuration = Record<ConfigurationKeys[number], string>

const configurationApi: ConfigurationApi<Configuration> = {
  get: async (name) => {
    const { parsed } = config({
      path: path.join(__dirname, "..", "..", "..", ".secrets.env"),
    })

    return (parsed as unknown as Configuration)[name.replace(/\//g, "_")]
  },
  getNames: () => configurationNames,
}

export type { Configuration }
export { configurationApi }
