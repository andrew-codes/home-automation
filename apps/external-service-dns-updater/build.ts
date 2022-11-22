import build from "@ha/build-ts"
import pkg from "./package.json"

build({ external: Object.keys(pkg.dependencies) })
