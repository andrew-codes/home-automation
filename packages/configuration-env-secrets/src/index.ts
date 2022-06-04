import path from "path"
import { ConfigurationApi } from "@ha/configuration-api"
import { config } from "dotenv"
import { toEnvName } from "@ha/secret-utils"

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

    return ({ ...process.env, ...parsed } as unknown as Configuration)[
      toEnvName(name)
    ]
  },
  getNames: () => configurationNames as ReadonlyArray<keyof Configuration>,
  set: async () => {},
}

export type { Configuration }
export { configurationApi, toEnvName }
