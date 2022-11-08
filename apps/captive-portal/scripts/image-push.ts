import fs from "fs/promises"
import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"
import { fromPairs } from "lodash"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const packageJson = require("../package.json")
  packageJson.dependencies = fromPairs(
    Object.entries(packageJson.dependencies).filter(
      ([key]) => !key.startsWith("@ha/"),
    ),
  )

  await fs.writeFile(
    path.join(__dirname, "..", "dist", "package.json"),
    JSON.stringify(packageJson, null, 2),
  )

  const docker = await createClient(configurationApi)
  await docker.build(`${name}:latest`)
  await docker.pushImage(`${name}:latest`)
}

export default run
