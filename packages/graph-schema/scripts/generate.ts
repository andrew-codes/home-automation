import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import { codegen } from "@graphql-codegen/core"
import { printSchema, parse, GraphQLSchema } from "graphql"
import * as schemaAstPlugin from "@graphql-codegen/schema-ast"
import { buildSubgraphSchema } from "@apollo/subgraph"
import gql from "graphql-tag"
import { glob } from "glob"

const buildSchema = async (schemaFilePath, outPath) => {
  delete require.cache[schemaFilePath]
  const schemaContent = require(schemaFilePath)

  const schema: GraphQLSchema = buildSubgraphSchema({
    typeDefs: gql`
      ${schemaContent.default}
    `,
  })

  const config = {
    documents: [],
    config: { federation: true },
    filename: outPath,
    schema: parse(printSchema(schema)),
    generates: {
      [outPath]: {
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

  return await codegen(config)
}

const run = async (configApi, ctx): Promise<void> => {
  const srcDir = path.join(__dirname, "..", "src")
  const outDir = path.join(srcDir, "generated")
  await fs.mkdir(outDir, { recursive: true })
  const schemaFiles = await glob(path.join(srcDir, "schemas", "*.ts"))

  await Promise.all(
    schemaFiles.map(async (filePath) => {
      const fileName = path.basename(filePath, ".ts")
      const schemaOut = path.join(outDir, `${fileName}.graphql`)
      const schema = await buildSchema(filePath, schemaOut)
      await fs.writeFile(schemaOut, schema, "utf8")
    }),
  )

  sh.env["APOLLO_ELV2_LICENSE"] = "accept"
  const { stdout } = sh.exec(
    `yarn rover supergraph compose --config supergraph.yaml`,
    {
      cwd: path.join(".", "src"),
    },
  )

  const schemaTsContents = `
const schema = \`
${stdout.replace(/`/g, "\\`")}
\`

export default schema
`

  await fs.writeFile(path.join(outDir, "schema.ts"), schemaTsContents, "utf8")

  const indexTsContents = `
${schemaFiles
  .map((filePath) => {
    const fileName = path.basename(filePath, ".ts")
    return `export {default as ${fileName}} from '../schemas/${fileName}'`
  })
  .join("")}
export { default as schema } from "./schema"
export { resolvers as scalarResolvers } from "graphql-scalars"

`

  await fs.writeFile(path.join(outDir, "index.ts"), indexTsContents, "utf8")
}

export default run
