import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import createClient from "@ha/docker"
import { existsSync } from "fs"
import fs from "fs/promises"
import { fromPairs } from "lodash"
import path from "path"
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
  packageJson.devDependencies = fromPairs(
    Object.entries(packageJson.devDependencies).filter(
      ([key]) => !key.startsWith("@ha/"),
    ),
  )

  await fs.writeFile(
    path.join(__dirname, "..", "dist", "package.json"),
    JSON.stringify(packageJson, null, 2),
  )

  const patchesDirectory = path.join(__dirname, "..", "..", "..", "patches")

  if (existsSync(patchesDirectory)) {
    await fs.cp(
      path.join(__dirname, "..", "..", "..", "patches"),
      path.join(__dirname, "..", "dist", "patches"),
      { recursive: true },
    )
  }

  const docker = await createClient(configurationApi)
  await docker.build(`${name}:latest`)
  await docker.pushImage(`${name}:latest`)
}

export default run
