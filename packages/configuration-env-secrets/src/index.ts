import path from "path"
import { ConfigurationApi } from "@ha/configuration-api"
import { config } from "dotenv"
import { toEnvName } from "@ha/secret-utils"

const configurationNames = [
  "onepassword/server-url",
  "onepassword/token",
  "onepassword/vault-id",
  "code-cov/token",
] as const

type ConfigurationKeys = typeof configurationNames
type Configuration = Record<ConfigurationKeys[number], string>

const configurationApi: ConfigurationApi<Configuration> = {
  get: async (name) => {
    const { parsed } = config({
      path: path.join(__dirname, "..", "..", "..", ".secrets.env"),
    })
    const value = ({ ...process.env, ...parsed } as unknown as Configuration)[
      toEnvName(name)
    ]
    if (!value) {
      throw new Error(`Configuration value ${name} not found.`)
    }

    return value
  },
  getNames: () => configurationNames as ReadonlyArray<keyof Configuration>,
  set: async () => {},
}

export type { Configuration }
export { configurationApi }
