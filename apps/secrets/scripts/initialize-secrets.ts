import { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  let secretsSetFromTemplate: {
    default: { name: keyof Configuration; value: string }[]
  }

  try {
    secretsSetFromTemplate = (await import(
      "../.secrets/template.secrets.js"
    )) as unknown as {
      default: { name: keyof Configuration; value: string }[]
    }
  } catch (error) {
    throw new Error(
      "'../.secrets/template.secrets' file not found. Please run `yarn nx run secrets:template` first.",
    )
  }

  for (const item of secretsSetFromTemplate.default) {
    try {
      await configurationApi.set(item.name, item.value.replace(/\n/g, "\\n"))
    } catch (error: any) {
      logger.error(error?.message)
    }
  }
}

export default run
