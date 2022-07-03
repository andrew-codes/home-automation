import build from "@ha/build-ts"
import pkg from "./package.json"

const entryPoints = [
  "./src/executors/docker-run/impl.ts",
  "./src/executors/invoke/impl.ts",
  "./src/executors/run-with-az/impl.ts",
  "./src/executors/telepresence/impl.ts",
  "./src/executors/upload-codecov/impl.ts",
]

run()

async function run() {
  try {
    for (const entryPoint of entryPoints) {
      const entryPointParts = entryPoint.split("/")
      const outFile = `${entryPointParts[entryPointParts.length - 2]}.js`
      await build({
        entryPoints: [entryPoint],
        outfile: `dist/${outFile}`,
        external: Object.keys(pkg.dependencies),
      })
    }
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}
