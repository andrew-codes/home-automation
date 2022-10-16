import { Configuration as AzureKvConfiguration } from "@ha/configuration-azure-kv"
import { Configuration as OnePasswordConfiguration } from "@ha/configuration-azure-kv"
import { Configuration as EnvConfiguration } from "@ha/configuration-env-secrets"

type Configuration = {} & OnePasswordConfiguration &
  AzureKvConfiguration &
  EnvConfiguration

export type { Configuration, EnvConfiguration, OnePasswordConfiguration }
