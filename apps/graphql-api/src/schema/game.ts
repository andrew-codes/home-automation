import path from "path"
import { list, objectType } from "nexus"
import { equality } from "../filter"
import {
  DomainGame,
  DomainGameArtwork,
  DomainGameCollection,
  DomainGameCover,
  DomainGameFranchise,
  DomainGameGenre,
  DomainGameKeyword,
  DomainGameMultiplayerMode,
  DomainGamePlayerPerspective,
  GameCollection,
  GameEntity,
  GameFranchise,
  GameGenre,
  GameImage,
  GameKeyword,
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

export const GameKeywordGraphType = objectType({
  name: "GameKeyword",
  sourceType: {
    export: "GameKeyword",
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
    t.field("games", {
      type: list(GameGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game",
          filters: [equality<DomainGame>("genres", root.id)],
        }) as Promise<GameEntity[]>
      },
    })
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
    t.field("games", {
      type: list(GameGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game",
          filters: [equality<DomainGame>("id", root.games)],
        }) as Promise<GameEntity[]>
      },
    })
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
    t.field("games", {
      type: list(GameGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game",
          filters: [equality<DomainGame>("id", root.games)],
        }) as Promise<GameEntity[]>
      },
    })
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
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_cover",
          filters: [equality<DomainGameCover>("id", root.cover)],
        }) as Promise<GameImage>
      },
    })
    t.field("collection", {
      type: GameCollectionGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_collection",
          filters: [equality<DomainGameCollection>("id", root.collection)],
        }) as Promise<GameCollection>
      },
    })
    t.field("franchise", {
      type: GameFranchiseGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_franchise",
          filters: [equality<DomainGameFranchise>("id", root.franchise)],
        }) as Promise<GameFranchise>
      },
    })
    t.field("franchises", {
      type: list(GameFranchiseGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_franchise",
          filters: [equality<DomainGameFranchise>("id", root.franchises)],
        }) as Promise<GameFranchise[]>
      },
    })
    t.field("artworks", {
      type: list(GameImageGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_artwork",
          filters: [equality<DomainGameArtwork>("id", root.artworks)],
        }) as Promise<GameImage[]>
      },
    })
    t.field("genres", {
      type: list(GameGenreGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_genre",
          filters: [equality<DomainGameGenre>("id", root.genres)],
        }) as Promise<GameGenre[]>
      },
    })
    t.field("keywords", {
      type: list(GameKeywordGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_keyword",
          filters: [equality<DomainGameKeyword>("id", root.keywords)],
        }) as Promise<GameKeyword[]>
      },
    })
    t.field("multiplayerMode", {
      type: GameMultiPlayerModeGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_multiplayer_mode",
          filters: [
            equality<DomainGameMultiplayerMode>("id", root.multiplayerMode),
          ],
        }) as Promise<GameMultiplayerMode>
      },
    })
    t.field("playerPerspective", {
      type: GamePlayerPerspectiveGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_player_perspective",
          filters: [
            equality<DomainGamePlayerPerspective>("id", root.playerPerspective),
          ],
        }) as Promise<GamePlayerPerspective>
      },
    })
  },
})
