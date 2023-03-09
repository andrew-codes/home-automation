import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (): Promise<void> => {
  await throwIfError(
    sh.exec("curl -sSL https://router.apollo.dev/download/nix/latest | bash", {
      silent: true,
      async: true,
    }),
  )
}

export default run
