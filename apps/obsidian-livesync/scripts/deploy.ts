import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import fs from "fs/promises"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port_external = await configurationApi.get(
    "obsidian-livesync/port/external",
  )
  const couchDbUsername = await configurationApi.get(
    "obsidian-livesync/username",
  )
  const couchDbPassword = await configurationApi.get(
    "obsidian-livesync/password",
  )

  const localIni = await fs
    .readFile(path.join(__dirname, "..", "src", "local.ini"))
    .toString()

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      name: "obsidian-livesync",
      port: parseInt(port_external.value),
      localIni,
      couchDbUser: couchDbUsername.value,
      couchDbPassword: couchDbPassword.value,
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", "mqtt")
}

export default run
