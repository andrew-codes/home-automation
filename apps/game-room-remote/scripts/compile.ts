import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (): Promise<void> => {
  throwIfError(sh.exec("yarn tsc -b"))
  throwIfError(sh.exec("yarn remix build"))
}

export default run
