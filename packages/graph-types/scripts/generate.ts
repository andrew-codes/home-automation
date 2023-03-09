import schemaString from "@ha/graph-schema"
import fs from "fs/promises"
import path from "path"
import { generate } from "@graphql-codegen/cli"
import * as client from "@graphql-codegen/client-preset"

const run = async (): Promise<void> => {
  await fs.mkdir(path.join(__dirname, "..", "generated"), { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", "generated", "schema.graphql"),
    schemaString,
    "utf8",
  )

  const srcGenerated = path.join(__dirname, "..", "src", "generated")
  await generate({
    schema: path.join(__dirname, "..", "generated", "schema.graphql"),
    documents: [
      path.join(__dirname, "..", "..", "..", "**", "*.tsx"),
      path.join(__dirname, "..", "..", "..", "**", "*.ts"),
    ],
    generates: {
      [`${srcGenerated}/`]: {
        plugins: ["typescript"],
        preset: client.preset,
        presetConfig: {
          gqlTagName: "gql",
        },
      },
    },
    ignoreNoDocuments: true,
  })

  await fs.appendFile(
    path.join(srcGenerated, "index.ts"),
    `
export * from './graphql';`,
    "utf8",
  )
}

export default run
