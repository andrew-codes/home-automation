import { Configuration as AzureKvConfiguration } from "@ha/configuration-azure-kv"
import { Configuration as EnvConfiguration } from "@ha/configuration-env-secrets"

type Configuration = {} & AzureKvConfiguration & EnvConfiguration

export type { Configuration }
