import fs from "fs/promises"
import path from "path"
import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"
import { toEnvName, toK8sName } from "@ha/secret-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const secretNames = configurationApi.getNames()
  const kvName = await configurationApi.get("azure/key-vault/name")
  await fs.mkdir(path.join(__dirname, "..", "dist"), { recursive: true })

  const secretDefinitionsJsonnet = secretNames.map((name, index) => {
    return `"${name}": lib.akvSecrets.new("${kvName}", "${toK8sName(
      name,
    )}", "${toEnvName(name)}")`
  })
  const secretDefinitionJsonnet = `
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

{
  ${secretDefinitionsJsonnet.join(`,
  `)}
}`
  await fs.writeFile(
    path.join(__dirname, "..", "dist", "index.jsonnet"),
    secretDefinitionJsonnet,
    "utf8",
  )

  const secretsJsonnet = secretNames.map((name, index) => {
    return `"${name}": k.core.v1.envVar.fromSecretRef("${toEnvName(
      name,
    )}", "${toK8sName(name)}", 'secret-value')`
  })
  const secretJsonnet = `
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet";

{
  ${secretsJsonnet.join(`,
  `)}
}`
  await fs.writeFile(
    path.join(__dirname, "..", "dist", "secrets.jsonnet"),
    secretJsonnet,
    "utf8",
  )
}

export default run
