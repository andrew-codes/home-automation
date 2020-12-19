import { config } from "dotenv"
config()
import { concat, flow } from "lodash/fp"
import path from "path"
import { makeSchema, nullabilityGuardPlugin } from "nexus"

import * as area from "./home_assistant_area"
import * as domain from "./home_assistant_domain"
import * as entity from "./home_assistant_entity"
import * as mutations from "./mutations"
import * as queries from "./queries"

const guardPlugin = nullabilityGuardPlugin({
  onGuarded({ info }) {
    console.error(
      `Error: Saw a null value for non-null field ${info.parentType.name}.${info.fieldName}`
    )
  },
  // A map of `typeNames` to the values we want to replace with if a "null" value
  // is seen in a position it shouldn't be. These can also be provided as a config property
  // for the `objectType` / `enumType` definition, as seen below.
  fallbackValues: {
    Int: () => 0,
    String: () => "",
    ID: ({ info }) => `${info.parentType.name}:NULL`,
    Boolean: () => false,
    Float: () => 0,
  },
})

const createTypes = flow([
  concat(area),
  concat(domain),
  concat(entity),
  concat(mutations),
  concat(queries),
])

export const schema = makeSchema({
  types: createTypes(),
  plugins: [guardPlugin],
  outputs: {
    schema: path.join(__dirname, "../generated/schema.graphql"),
    typegen: path.join(__dirname, "../generated/nexusTypes.gen.ts"),
  },
  contextType: {
    export: "DataContext",
    module: path.join(__dirname, "..", "dataContext.ts"),
    alias: "ctx",
  },
})
