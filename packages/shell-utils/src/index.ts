import { doIf } from "@ha/env-utils"

const throwIfError = ({ stdout, stderr }) => {
  console.log(stdout)
  doIf(() => !!stderr)(() => {
    throw new Error(stderr)
  })
}

export { throwIfError }