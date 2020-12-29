import path from "path"
import { list, objectType } from "nexus"
import { first } from "lodash"
import { equality } from "../filter"
import {
  GameCollection,
  GameFranchise,
  GameGenre,
  GameImage,
  GameMultiplayerMode,
  GamePlayerPerspective,
} from "../Domain"

export const GameImageGraphType = objectType({
  name: "GameImage",
  sourceType: {
    export: "GameImage",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.int("height")
    t.string("imageId")
  },
})

export const GamePlayerPerspectiveGraphType = objectType({
  name: "GamePlayerPerspective",
  sourceType: {
    export: "GamePlayerPerspective",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("name")
    t.string("slug")
  },
})

export const GameGenreGraphType = objectType({
  name: "GameGenre",
  sourceType: {
    export: "GameGenre",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("name")
    t.string("slug")
  },
})

export const GameCollectionGraphType = objectType({
  name: "GameCollection",
  sourceType: {
    export: "GameCollection",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("name")
    t.string("slug")
  },
})

export const GameFranchiseGraphType = objectType({
  name: "GameFranchise",
  sourceType: {
    export: "GameFranchise",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("name")
    t.string("slug")
  },
})
export const GameMultiPlayerModeGraphType = objectType({
  name: "GameMultiPlayerMode",
  sourceType: {
    export: "GameMultiPlayerMode",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.boolean("campaigncoop")
    t.boolean("dropIn")
    t.boolean("lancoop")
    t.boolean("offlinecoop")
    t.int("offlinecoopmax")
    t.int("offlinemax")
    t.boolean("onlinecoop")
    t.int("onlinecoopmax")
    t.int("onlinemax")
    t.boolean("splitscreen")
  },
})

export const GameGraphType = objectType({
  name: "Game",
  sourceType: {
    export: "GameEntity",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("playniteId")
    t.int("playtime")
    t.int("releaseYear", {
      resolve(root) {
        if (!root.firstReleaseDate) {
          return null
        }
        const date = new Date(root.firstReleaseDate * 1000)
        return date.getFullYear()
      },
    })
    t.string("name")
    t.string("platform")
    t.string("summary")
    t.string("slug")
    t.field("cover", {
      type: GameImageGraphType,
      async resolve(root, args, ctx) {
        const results = await ctx.query({
          from: "game_cover",
          filters: [equality(["id"], root.cover)],
        })
        return first(results) as GameImage
      },
    })
    t.field("collection", {
      type: GameCollectionGraphType,
      async resolve(root, args, ctx) {
        const results = await ctx.query({
          from: "game_collection",
          filters: [equality(["id"], root.collection)],
        })
        return first(results) as GameCollection
      },
    })
    t.field("franchise", {
      type: GameFranchiseGraphType,
      async resolve(root, args, ctx) {
        const results = await ctx.query({
          from: "game_franchise",
          filters: [equality(["id"], root.franchise)],
        })
        return first(results) as GameFranchise
      },
    })
    t.field("franchises", {
      type: list(GameFranchiseGraphType),
      async resolve(root, args, ctx) {
        return ctx.query({
          from: "game_franchise",
          filters: [equality(["id"], root.franchises)],
        }) as Promise<GameFranchise[]>
      },
    })
    t.field("artworks", {
      type: list(GameImageGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_artwork",
          filters: [equality(["id"], root.artworks)],
        }) as Promise<GameImage[]>
      },
    })
    t.field("genres", {
      type: list(GameGenreGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_genre",
          filters: [equality(["id"], root.genres)],
        }) as Promise<GameGenre[]>
      },
    })
    t.field("multiplayerMode", {
      type: GameMultiPlayerModeGraphType,
      async resolve(root, args, ctx) {
        const result = await ctx.query({
          from: "game_multiplayer_mode",
          filters: [equality(["id"], root.multiplayerMode)],
        })
        return first(result) as GameMultiplayerMode
      },
    })
    t.field("playerPerspective", {
      type: GamePlayerPerspectiveGraphType,
      async resolve(root, args, ctx) {
        const result = await ctx.query({
          from: "game_player_perspective",
          filters: [equality(["id"], root.playerPerspective)],
        })
        return first(result) as GamePlayerPerspective
      },
    })
  },
})
