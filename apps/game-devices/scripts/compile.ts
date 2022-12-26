import build from "@ha/build-ts"
import pkg from "../package.json"

const run = async () => {
  await build({ external: Object.keys(pkg.dependencies) })
}

export default run
