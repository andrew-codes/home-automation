import { throwIfError } from "@ha/shell-utils"
import path from "path"
import sh from "shelljs"

const run = async (): Promise<void> => {
  const buildDir = path.join(__dirname, "..", "dist", "build")
  sh.mkdir("-p", buildDir)
  sh.cp(
    "-R",
    path.join(__dirname, "..", "..", "**", "generated", "*.graphql"),
    buildDir,
  )

  sh.env["APOLLO_ELV2_LICENSE"] = "accept"
  await throwIfError(
    sh.exec(
      `~/.rover/bin/rover supergraph compose --config src/supergraph.yaml > dist/schema.graphql`,
      { shell: "/bin/bash" },
    ),
  )
}

export default run
