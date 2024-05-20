import fs from "fs/promises"
import path from "path"
import type { Configuration } from "@ha/configuration-workspace"
import { ConfigurationApi } from "@ha/configuration-api"
import { toEnvName, toK8sName } from "@ha/secret-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  await fs.mkdir(path.join(__dirname, "..", "dist"), { recursive: true })

  const secretNames = configurationApi.getNames()
  const secretItems = await Promise.all(
    secretNames.map(async (name) => {
      try {
        return await configurationApi.get(name)
      } catch (error) {}
    }),
  )

  const vaultId = await configurationApi.get("onepassword/vault-id")
  const secretDefinitionsJsonnet = secretNames.map((name, index) => {
    const item = secretItems[index]
    let itemIdentifier: string = name
    if (!item) {
      return null
    }

    if (typeof item !== "string") {
      itemIdentifier = item.id
    }

    return `"${name}": lib.onePasswordSecrets.new("${vaultId}", "${toK8sName(
      name,
    )}", "${itemIdentifier}")`
  })
  const secretDefinitionJsonnet = `
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

{
  ${secretDefinitionsJsonnet.filter((def) => !!def).join(`,
  `)}
}`
  await fs.writeFile(
    path.join(__dirname, "..", "dist", "index.jsonnet"),
    secretDefinitionJsonnet,
    "utf8",
  )

  const secretsJsonnet = secretNames.map((name) => {
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
