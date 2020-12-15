import { defaultTo, isEmpty } from "lodash"
import { merge } from "lodash/fp"
import {
  arg,
  inputObjectType,
  mutationField,
  objectType,
  queryField,
  stringArg,
} from "@nexus/schema"
import createDebug from "debug"
import { Node } from "./node"
import { Platform } from "./platform"
import { equality } from "../filter"
import { MediaPlayer } from "./home_assistant_media_player"

const debug = createDebug("@ha/graphql-api/schema/game")

export const Game = objectType({
  name: "Game",
  definition(t) {
    t.implements(Node)
    t.string("name", (r) => r.name.replace(/[®™:-]/g, ""))
    t.string("appid")
    t.string("iconUrl", (r) => r.img_icon_url || "")
    t.string("logoUrl", (r) => r.img_logo_url || "")
    t.int("playtime", (r) => r.playtime_forever || 0)
    t.field("entity", {
      type: MediaPlayer,
      async resolve(root, args, ctx) {
        const data = await ctx.query({
          from: "home_assistant_entity",
          filters: [equality.filter("id", root.entity_id)],
        })
        return data[0]
      },
    })
    t.field("platform", {
      type: Platform,
      async resolve(root, args, ctx) {
        const data = await ctx.query({
          from: "platform",
          filters: [equality.filter("id", root.platform_id)],
        })
        return data[0]
      },
    })
  },
})

// Queries
export const GameQuery = queryField("game", {
  list: true,
  type: Game,
  args: { ids: stringArg({ required: false, list: true }) },
  resolve(root, args, ctx) {
    const query = { from: "game" }
    const filters = []
    if (!!args.ids) {
      filters.push(equality.filter("id", args.ids))
    }
    if (!isEmpty(filters)) {
      query.filters = filters
    }
    return ctx.query(query)
  },
})

// Mutations
export const InputGame = inputObjectType({
  name: "InputGame",
  definition(t) {
    t.string("appid", { required: true })
    t.string("entity_id", { require: true })
    t.string("name", { require: true })
    t.string("img_icon_url")
    t.string("img_logo_url")
    t.int("playtime_forever")
  },
})
export const InputLibrary = inputObjectType({
  name: "InputLibrary",
  definition(t) {
    t.field("playstation_4", { type: InputGame, list: true })
    t.field("steam", { type: InputGame, list: true })
  },
})
export const MergeLibrary = mutationField("library", {
  type: Game,
  args: {
    library: arg({ type: InputLibrary }),
  },
  list: true,
  async resolve(root, args, ctx) {
    const newplaystationGames = await getPs4Games(
      ctx,
      args.library.playstation_4
    )
    const newSteamGames = await getSteamGames(ctx, args.library.steam)
    const games = newplaystationGames.concat(newSteamGames)
    debug("games to merge", games)

    const mergedGamesOutput = await ctx.query({
      from: "game",
      act: "new",
      select: [
        "appid",
        "name",
        "platform_id",
        "img_icon_url",
        "img_logo_url",
        "playtime_forever",
        "entity_id",
      ],
      values: games,
    })
    debug("merged game output", mergedGamesOutput)
    return mergedGamesOutput
  },
})

async function getPs4Games(ctx, games) {
  return defaultTo(games, [])
    .map(
      merge({
        platform_id: "playstation_4",
      })
    )
    .map((g) => merge({ appid: g.name })(g))
}

async function getSteamGames(ctx, games) {
  return defaultTo(games, [])
    .map(merge({ platform_id: "steam" }))
    .map((g) => merge(g)({ appid: g.appid.toString() }))
}
