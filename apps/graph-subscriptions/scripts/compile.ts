import build from "@ha/build-ts"
import path from "path"
import fs from "fs/promises"
import sh from "shelljs"
import { schema } from "@ha/graph-subscriptions-schema"

const run = async (): Promise<void> => {
  const distDir = path.join(__dirname, "..", "dist")
  sh.mkdir("-p", distDir)
  await fs.writeFile(path.join(distDir, "schema.graphql"), schema, "utf8")
  await build()
}

export default run
