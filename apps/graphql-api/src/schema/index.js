import { config } from "dotenv"
config()
import _fp from "lodash/fp.js"
import GraphQLDate from "graphql-iso-date"
import path from "path"
import {
  asNexusMethod,
  makeSchema,
  nullabilityGuardPlugin,
} from "nexus"

const { concat, flow } = _fp
import * as area from "./home_assistant_area.js"
import * as domain from "./home_assistant_domain.js"
import * as entity from "./home_assistant_entity.js"
// import * as game from "./game"
// import * as light from "./home_assistant_light"
// import * as media_player from "./home_assistant_media_player"
// import * as node from "./node"
// import * as platform from "./platform"
// import * as presence_devices from "./home_assistant_presence_devices"
// import * as shopping_list from "./shopping_list"
// import * as spotify_credentials from "./spotify_credentials"
// import * as spotify_playlist from "./spotify_playlist"

const guardPlugin = nullabilityGuardPlugin({
  onGuarded({ ctx, info }, root) {
    // This could report to a service like Sentry, or log internally - up to you!
    console.error(
      `Error: Saw a null value for non-null field ${info.parentType.name}.${
        info.fieldName
      } ${root ? `(${root.id || root._id})` : ""}`
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
  // concat(game),
  // concat(light),
  // concat(media_player),
  // concat(node),
  // concat(platform),
  // concat(presence_devices),
  // concat(shopping_list),
  // concat(spotify_credentials),
  // concat(spotify_playlist),
])

export const schema = makeSchema({
  types: createTypes(),
  plugins: [guardPlugin],
  outputs: {
    schema: path.join(__dirname, "../schema.graphql"),
  },
})
