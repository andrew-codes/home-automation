import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretNames = configurationApi.getNames()
  const secretValues = await Promise.all(
    secretNames.map((name: keyof Configuration) => configurationApi.get(name)),
  )
  const unsetSecretIndices = secretValues.reduce((acc, value, index) => {
    if (!value) {
      return acc.concat([index])
    }
    return acc
  }, [])

  await Promise.all(
    unsetSecretIndices.map((secretIndex) =>
      configurationApi.set(secretNames[secretIndex], "change me"),
    ),
  )
}

export default run
