import sh from "shelljs"
import path from "path"
import nodemon from "nodemon"

const run = async (): Promise<void> => {
  nodemon({
    verbose: true,
    ignore: [path.join(__dirname, "..", "src", "generated")],
    watch: [path.join(__dirname, "..", "src", "**", "*.*")],
    script: path.join(__dirname, "compile-dev.ts"),
    execMap: {
      js: "yarn node --require esbuild-register",
      ts: "yarn node --require esbuild-register",
    },
  })
}

if (require.main === module) {
  run()
}

export default run
