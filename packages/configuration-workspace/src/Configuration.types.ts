import { Configuration as StaticConfiguration } from "@ha/configuration-static"
import { Configuration as AzureKvConfiguration } from "@ha/configuration-azure-kv"

type Configuration = {} & StaticConfiguration & AzureKvConfiguration

export type { Configuration }
