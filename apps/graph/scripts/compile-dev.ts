import { throwIfError } from "@ha/shell-utils"
import path from "path"
import sh from "shelljs"

const run = async (): Promise<void> => {
  sh.mkdir("-p", "dist")
  sh.env["APOLLO_ELV2_LICENSE"] = "accept"
  await throwIfError(
    sh.exec(
      `~/.rover/bin/rover supergraph compose --config ${path.join(
        __dirname,
        "..",
        "src",
        "supergraph-dev.yaml",
      )} > dist/schema.graphql`,
      { shell: "/bin/bash" },
    ),
  )
}

if (require.main === module) {
  run()
}
