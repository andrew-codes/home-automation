import fs from "fs/promises"
import path from "path"
import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })
  const secretNames = configurationApi.getNames()
  const secretsValues = await Promise.all(
    secretNames.map(async (name) => {
      const value = await configurationApi.get(name)
      return { name, value: typeof value === "string" ? value : value.value }
    }),
  )
  const secretTemplates = secretsValues.map(
    ({ name, value }) => `{
    name: "${name}",
    value: \`${value}\`,
  },`,
  )

  const secretTemplate = `const secrets = [
  ${secretTemplates.join(`
  `)}
]

module.exports = secrets
`

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "template.secrets.js"),
    secretTemplate,
    "utf8",
  )
}

export default run
