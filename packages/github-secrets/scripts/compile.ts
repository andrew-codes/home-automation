import build from "@ha/build-ts"
import pkg from "../package.json"

const run = async (): Promise<void> => {
  await build({
    entryPoints: ["src/bin/seal.ts"],
    external: Object.keys(pkg.dependencies),
    outfile: "dist/seal.js",
  })
}

export default run
