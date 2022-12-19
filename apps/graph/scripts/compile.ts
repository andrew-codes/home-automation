import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (): Promise<void> => {
  sh.mkdir("-p", "dist")
  throwIfError(
    sh.exec(
      `rover supergraph compose --config src/supergraph.yaml > dist/schema.graphql`,
      { async: true },
    ),
  )
}

export default run
