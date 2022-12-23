import nodemon from "nodemon"
import path from "path"
import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"

const run = async () => {
  nodemon({
    verbose: true,
    // ignore: ["**/apps/graph/dist/*.graphql"],
    watch: ["dist/build/*"],
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
      throwIfError(
        sh.exec(
          `docker kill graph; docker container rm graph; docker run --name graph -d -p 8081:4000 --network host --volume ${path.join(
            __dirname,
            "..",
            "dist",
          )}:/schema ghcr.io/apollographql/router:v1.6.0 --dev --supergraph /schema/schema.graphql;`,
        ),
      )
    })
    .on("restart", (files) => {
      throwIfError(
        sh.exec(
          `docker kill graph; docker container rm graph; docker run --name graph -d -p 8081:4000 --network host --volume ${path.join(
            __dirname,
            "..",
            "dist",
          )}:/schema ghcr.io/apollographql/router:v1.6.0 --dev --supergraph /schema/schema.graphql;`,
        ),
      )
    })
    .on("exit", () => {
      console.log("exiting")
    })
    .on("crash", () => console.log("crashed"))
}

if (require.main === module) {
  run()
}
