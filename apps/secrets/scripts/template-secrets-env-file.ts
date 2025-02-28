import { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretsPath = path.join(__dirname, "..", ".secrets")
  await fs.mkdir(secretsPath, {
    recursive: true,
  })
  const secretNames = configurationApi.getNames()
  const secretsValues = await Promise.all(
    secretNames.map(async (name) => {
      let value
      try {
        value = await configurationApi.get(name)
      } catch (error) {
        console.error(error)
      }
      const secretValue =
        value != null ? (typeof value === "string" ? value : value.value) : ""
      return { name, value: secretValue }
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
    path.join(secretsPath, "template.secrets.js"),
    secretTemplate,
    "utf8",
  )
}

export default run
