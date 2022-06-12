import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretNames = configurationApi.getNames()
  let secretsSetFromTemplate: { name: keyof Configuration; value: string }[]

  try {
    secretsSetFromTemplate = (await import(
      "../.secrets/template.secrets.js"
    )) as unknown as { name: keyof Configuration; value: string }[]
  } catch (error) {
    throw new Error(
      "'../.secrets/template.secrets' file not found. Please run `yarn nx run secrets:template` first.",
    )
  }

  const allSecretsSet = secretNames.every((secretName) =>
    secretsSetFromTemplate.some(
      ({ name, value }) => secretName === name && !!value,
    ),
  )
  if (!allSecretsSet) {
    throw new Error(
      "Not all secrets in template set and accounted for. Please re-run  `yarn nx run secrets:template` and ensure no secrets are removed and all secrets are set.",
    )
  }

  await Promise.all(
    secretsSetFromTemplate.map(({ name, value }) =>
      configurationApi.set(name, value.replace(/\n/g, "\\n")),
    ),
  )
}

export default run
