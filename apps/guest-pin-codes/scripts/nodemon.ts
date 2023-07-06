import nodemon from "nodemon"
import path from "path"

const run = async () => {
  nodemon({
    verbose: true,
    ignore: ["*.test.js", "fixtures/*"],
    watch: [path.join(__dirname, "..", "src")],
    script: path.join(__dirname, "..", "src", "index.ts"),
    env: { PORT: "8086", DEBUG: "@ha/guest-pin-codes/*" },
    execMap: {
      js: "node --require esbuild-register",
      ts: "node --require esbuild-register",
      tsx: "node --require esbuild-register",
    },
  })
    .on("start", () => {
      console.log("nodemon started")
    })
    .on("restart", (files) => {
      console.log("nodemon restarted")
    })
    .on("exit", () => {
      console.log("exiting")
    })
    .on("quit", () => console.log("quiting"))
    .on("crash", () => console.log("crashed"))
}

if (require.main === module) {
  run()
}

export default run
