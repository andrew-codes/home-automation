import { doIf } from "@ha/env-utils"
import createDebugger from "debug"

const debug = createDebugger("@ha/shell-utils/index")

const throwIfError = ({ stdout, stderr, code }) => {
  debug(stdout)
  doIf(() => code !== 0)(() => {
    debug(stderr)
    throw new Error(stderr)
  })

  return stdout
}

export { throwIfError }
