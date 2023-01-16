import build from "@ha/build-ts"
import path from "path"
import pkg from "../package.json"

const run = async (): Promise<void> => {
  await build({
    entryPoints: [path.join(__dirname, "..", "src", "bin", "seal.ts")],
    external: Object.keys(pkg.dependencies),
    outfile: path.join(__dirname, "..", "dist", "seal.js"),
  })
}

export default run
