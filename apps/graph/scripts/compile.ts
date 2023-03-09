import path from "path"
import fs from "fs/promises"
import sh from "shelljs"
import schema from "@ha/graph-schema"

const run = async (): Promise<void> => {
  const distDir = path.join(__dirname, "..", "dist")
  sh.mkdir("-p", distDir)
  await fs.writeFile(path.join(distDir, "schema.graphql"), schema, "utf8")
}

export default run
