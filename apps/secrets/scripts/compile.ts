import fs from "fs/promises"
import path from "path"
import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"
import { toEnvName } from "@ha/secret-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretNames = configurationApi.getNames()
  const secretsJsonnet = secretNames.map((name, index) => {
    return `"${name}": k.core.v1.envVar.fromSecretRef("${toEnvName(
      name,
    )}", "${name}", 'secret-value')`
  })
  const secretJsonnet = `
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet";

{
  ${secretsJsonnet.join(`,
  `)}
}`
  await fs.mkdir(path.join(__dirname, "..", "dist"), { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", "dist", "index.jsonnet"),
    secretJsonnet,
    "utf8",
  )
}

export default run
