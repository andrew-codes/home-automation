import build from "@ha/build-ts"
import pkg from "../package.json"

const run = async (): Promise<void> => {
  await build({ external: Object.keys(pkg.dependencies) })
}

export default run
