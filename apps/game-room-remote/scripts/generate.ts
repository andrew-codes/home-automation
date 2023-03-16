import { schema } from "@ha/graph-schema"
import { schema as subscriptionSchema } from "@ha/graph-subscriptions-schema"
import fs from "fs/promises"
import path from "path"
import { generate } from "@graphql-codegen/cli"
import * as client from "@graphql-codegen/client-preset"

const run = async (): Promise<void> => {
  await fs.mkdir(path.join(__dirname, "..", "generated"), { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", "generated", "schema.graphql"),
    `${schema}

${subscriptionSchema.replace(
  `type Query {
  health: String!
}`,
  "",
)}`,
    "utf8",
  )

  const srcGenerated = path.join(__dirname, "..", "src", "generated")
  await generate({
    schema: path
      .join(__dirname, "..", "generated", "schema.graphql")
      .replace(path.sep, "/"),
    documents: ["src/**/*.ts", "src/**/*.tsx"],
    config: { federation: true },
    generates: {
      [`${srcGenerated}/`.replace(path.sep, "/")]: {
        plugins: [],
        preset: client.preset,
        presetConfig: {
          gqlTagName: "gql",
        },
      },
    },
    ignoreNoDocuments: true,
  })
}

export default run
