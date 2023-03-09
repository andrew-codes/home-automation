import path from "path"
import { codegen } from "@graphql-codegen/core"
import { printSchema, parse, GraphQLSchema } from "graphql"
import fs from "fs/promises"
import * as schemaAstPlugin from "@graphql-codegen/schema-ast"
import { buildSubgraphSchema } from "@apollo/subgraph"
import gql from "graphql-tag"

const buildSchema = async () => {
  const buildDir = path.join(__dirname, "..", "generated")
  await fs.mkdir(buildDir, { recursive: true })
  const schemaFile = path.join(__dirname, "..", "src", "schema.ts")
  delete require.cache[schemaFile]
  const schemaContent = require(schemaFile)
  const outputFile = path.join(buildDir, "graph-subscriptions.graphql")

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
  await buildSchema()
}

export default run
