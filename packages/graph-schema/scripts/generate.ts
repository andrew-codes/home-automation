import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (): Promise<void> => {
  const buildDir = path.join(__dirname, "..", "generated")
  sh.mkdir("-p", buildDir)
  sh.cp(
    "-R",
    path.join(__dirname, "..", "..", "..", "**", "generated", "*.graphql"),
    buildDir,
  )

  sh.env["APOLLO_ELV2_LICENSE"] = "accept"
  const { stdout } = sh.exec(
    `yarn rover supergraph compose --config supergraph.yaml`,
    {
      cwd: path.join(".", "src"),
    },
  )

  const schemaTsContents = `
const schema = \`
${stdout.replace(/`/g, "\\`")}
\`

export default schema
`

  await fs.writeFile(
    path.join(__dirname, "..", "src", "index.ts"),
    schemaTsContents,
    "utf8",
  )
}

export default run
