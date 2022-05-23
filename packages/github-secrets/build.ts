import build from "@ha/build-ts"

build({ entryPoints: ["src/bin/seal.ts"], outfile: "dist/seal.js" })
