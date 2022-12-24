import nodemon from "nodemon"
import path from "path"
import { codegen } from "@graphql-codegen/core"
import { printSchema, parse, GraphQLSchema } from "graphql"
import fs from "fs/promises"
import * as schemaAstPlugin from "@graphql-codegen/schema-ast"
import { buildSubgraphSchema } from "@apollo/subgraph"
import gql from "graphql-tag"
import sh from "shelljs"

const buildSchema = async () => {
  const buildDir = path.join(__dirname, "..", "..", "graph", "dist", "build")
  await fs.mkdir(buildDir, { recursive: true })
  const schemaFile = path.join(__dirname, "..", "src", "schema.ts")
  delete require.cache[schemaFile]
  const schemaContent = require(schemaFile)
  const outputFile = path.join(buildDir, "gaming.graphql")

  const schema: GraphQLSchema = buildSubgraphSchema({
    typeDefs: gql`
      ${schemaContent.default}
    `,
  })

  const config = {
    documents: [],
    config: { federation: true },
    filename: outputFile,
    schema: parse(printSchema(schema)),
    generates: {
      [outputFile]: {
        plugins: ["schema-ast"],
      },
    },
    plugins: [
      {
        "schema-ast": {
          federation: true,
        },
      },
    ],
    pluginMap: { "schema-ast": schemaAstPlugin },
  }

  const schemaContents = await codegen(config)
  await fs.writeFile(outputFile, schemaContents, "utf8")
  console.log("Schema build completed.")
}

const run = async () => {
  nodemon({
    verbose: true,
    ignore: ["*.test.js", "fixtures/*"],
    watch: [path.join(__dirname, "..", "src")],
    script: path.join(__dirname, "..", "src", "index.ts"),
    env: { PORT: "8082" },
    execMap: {
      js: "node --require esbuild-register",
      ts: "node --require esbuild-register",
    },
  })
    .on("start", () => {
      console.log("nodemon started")
      buildSchema()
    })
    .on("restart", (files) => {
      console.log("nodemon restarted")
      if (files?.some((filePath) => /src\/schema\.ts$/.test(filePath))) {
        buildSchema()
      }
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
