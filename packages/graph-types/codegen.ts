import { CodegenConfig } from "@graphql-codegen/cli"
import path from "path"

const config: CodegenConfig = {
  schema: path.join(__dirname, "generated", "schema.graphql"),
  generates: {
    "./src/client/": {
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
}

export default config
