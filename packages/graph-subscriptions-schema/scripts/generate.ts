import { codegen } from "@graphql-codegen/core"
import * as schemaAstPlugin from "@graphql-codegen/schema-ast"
import { makeExecutableSchema } from "@graphql-tools/schema"
import fs from "fs/promises"
import { GraphQLSchema, parse, printSchema } from "graphql"
import gql from "graphql-tag"
import path from "path"

const buildSchema = async (schemaFilePath, outPath) => {
  delete require.cache[schemaFilePath]
  const schemaContent = require(schemaFilePath)

  const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs: gql`
      ${schemaContent.default}
    `,
  })

  const config = {
    documents: [],
    config: {},
    filename: outPath,
    schema: parse(printSchema(schema)),
    generates: {
      [outPath]: {
        plugins: ["schema-ast"],
      },
    },
    plugins: [
      {
        "schema-ast": {},
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
  const schemaFiles = [path.join(srcDir, "schemas", "subscriptions.ts")]

  const [subscriptionSchema] = await Promise.all(
    schemaFiles.map(async (filePath) => {
      const fileName = path.basename(filePath, ".ts")
      const schemaOut = path.join(outDir, `${fileName}.graphql`)
      const schema = await buildSchema(filePath, schemaOut)
      await fs.writeFile(schemaOut, schema, "utf8")
      return schema
    }),
  )

  const schemaTsContents = `
const schema = \`
${subscriptionSchema.replace(/`/g, "\\`")}
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
`

  await fs.writeFile(path.join(outDir, "index.ts"), indexTsContents, "utf8")
}

export default run
