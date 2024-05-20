import build from "@ha/build-ts"
import pkg from "../package.json"

const run = async (): Promise<void> => {
  await build()
}

export default run
