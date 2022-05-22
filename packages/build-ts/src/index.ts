import esbuild from "esbuild"
import { isProd } from "@ha/env-utils"
import { merge } from "lodash"

const defaultConfig = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  minify: isProd(),
  outfile: "dist/index.js",
  platform: "node",
  sourcemap: true,
  target: "node16",
  resolveExtensions: [".ts", ".tsx", ".js"],
  define: [`process.env.NODE_ENV="${process.env.NODE_ENV}"`],
}

const build = async (overrides = {}) => {
  try {
    await esbuild.build(merge({}, defaultConfig, overrides) as any)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

export default build
