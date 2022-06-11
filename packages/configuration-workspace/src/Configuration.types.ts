import { Configuration as StaticConfiguration } from "@ha/configuration-static"
import { Configuration as AzureKvConfiguration } from "@ha/configuration-azure-kv"
import { Configuration as EnvConfiguration } from "@ha/configuration-env-secrets"

type Configuration = {} & StaticConfiguration & AzureKvConfiguration & EnvConfiguration

export type { Configuration }
