import { doIf } from "@ha/env-utils"
import createDebugger from "debug"

const debug = createDebugger("@ha/shell-utils/index")

const throwIfError = ({ stdout, stderr }) => {
  debug(stdout)
  doIf(() => !!stderr)(() => {
    throw new Error(stderr)
  })
}

export { throwIfError }
