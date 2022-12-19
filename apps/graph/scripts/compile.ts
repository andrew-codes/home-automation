import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (): Promise<void> => {
  sh.mkdir("-p", "dist")
  sh.env["APOLLO_ELV2_LICENSE"] = "yes"
  await throwIfError(
    sh.exec(
      `rover supergraph compose --config src/supergraph.yaml > dist/schema.graphql`,
    ),
  )
}

export default run
