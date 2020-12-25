import path from "path"
import { list, objectType } from "nexus"
import { first } from "lodash"
import { equality } from "../filter"
import { GameImage } from "../Domain"

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
    t.string("platformId")
    t.string("summary")
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
    t.field("artworks", {
      type: list(GameImageGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_artwork",
          filters: [equality(["id"], root.artworks)],
        }) as Promise<GameImage[]>
      },
    })
  },
})
