import { identity } from "lodash"
import { doIf } from "@ha/env-utils"

const throwIfError = ({ stdout, stderr }) => {
  console.log(stdout)
  doIf(identity(stderr))(() => {
    throw new Error(stderr)
  })
}

export default throwIfError
