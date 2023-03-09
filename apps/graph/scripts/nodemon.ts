import nodemon from "nodemon"
import path from "path"
import sh from "shelljs"

const run = async () => {
  sh.exec("docker container rm intercept-graph-8081 || true")
  sh.exec("telepresence leave graph")

  nodemon({
    verbose: true,
    // ignore: ["**/apps/graph/dist/*.graphql"],
    watch: ["dist/*", "../../**/generated/*.graphql"],
    script: path.join(__dirname, "..", "scripts", "compile-dev.ts"),
    execMap: {
      js: "node --require esbuild-register",
      ts: "node --require esbuild-register",
    },
    ext: "graphql",
  })
    .on("start", () => {
      console.log("nodemon started")
      console.log("Starting Docker container for Apollo Router")
      sh.exec(
        `telepresence intercept graph --mount false --service graph --port 8081:80 --docker-run -- --volume ${path.join(
          __dirname,
          "..",
        )}:/config  ghcr.io/apollographql/router:v1.6.0 --dev --supergraph /config/dist/schema.graphql --config /config/src/config.yaml`,
        { async: true },
      )
    })
    .on("restart", (files) => {})
    .on("exit", () => {
      console.log("exiting")
      sh.exec("telepresence leave graph")
    })
    .on("crash", () => {
      console.log("crashed")
      sh.exec("telepresence leave graph")
    })
}

if (require.main === module) {
  run()
}
