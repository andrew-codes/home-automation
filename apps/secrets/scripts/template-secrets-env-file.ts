import fs from "fs/promises"
import path from "path"
import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretNames = configurationApi.getNames()
  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })
  const secretTemplate = `const secrets = [
  ${secretNames.map(
    (name) => `{
    name: "${name}",
    value: \`\`,
  },`,
  ).join(`
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
