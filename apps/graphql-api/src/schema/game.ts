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
  DomainGameMode,
  DomainGameMultiplayerMode,
  DomainGamePlatform,
  DomainGamePlayerPerspective,
  DomainQuery,
  GameCollection,
  GameEntity,
  GameFranchise,
  GameGenre,
  GameImage,
  GameKeyword,
  GameMode,
  GameMultiplayerMode,
  GamePlatform,
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

export const GamePlatformGraphType = objectType({
  name: "GamePlatform",
  sourceType: {
    export: "GamePlatform",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("name")
    t.field("games", {
      type: list(GameGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game",
          filters: [equality("platformId", root.id)],
        } as DomainQuery<DomainGame>) as Promise<GameEntity[]>
      },
    })
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
    t.field("games", {
      type: list(GameGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game",
          filters: [equality("keywords", root.id)],
        } as DomainQuery<DomainGame>) as Promise<GameEntity[]>
      },
    })
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
          filters: [equality("genres", root.id)],
        } as DomainQuery<DomainGame>) as Promise<GameEntity[]>
      },
    })
  },
})

export const GameModeGraphType = objectType({
  name: "GameMode",
  sourceType: {
    export: "GameMode",
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
          filters: [equality("gameModes", root.id)],
        } as DomainQuery<DomainGame>) as Promise<GameEntity[]>
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
          filters: [equality("id", root.games)],
        } as DomainQuery<DomainGame>) as Promise<GameEntity[]>
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
          filters: [equality("id", root.games)],
        } as DomainQuery<DomainGame>) as Promise<GameEntity[]>
      },
    })
  },
})
export const GameMultiplayerModeGraphType = objectType({
  name: "GameMultiplayerMode",
  sourceType: {
    export: "GameMultiplayerMode",
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
    t.string("state")
    t.field("gameModes", {
      type: list(GameModeGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_mode",
          filters: [equality("id", root.gameModes)],
        } as DomainQuery<DomainGameMode>) as Promise<GameMode[]>
      },
    })
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
    t.boolean("favorite")
    t.boolean("hidden")
    t.string("source", {
      resolve(root, args, ctx) {
        return root.source.name
      },
    })
    t.field("platform", {
      type: GamePlatformGraphType,
      async resolve(root, args, ctx) {
        return ctx.query({
          from: "game_platform",
          filters: [equality("id", root.platformId)],
        } as DomainQuery<DomainGamePlatform>) as Promise<GamePlatform>
      },
    })
    t.string("summary")
    t.string("slug")
    t.field("cover", {
      type: GameImageGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_cover",
          filters: [equality("id", root.cover)],
        } as DomainQuery<DomainGameCover>) as Promise<GameImage>
      },
    })
    t.field("collection", {
      type: GameCollectionGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_collection",
          filters: [equality("id", root.collection)],
        } as DomainQuery<DomainGameCollection>) as Promise<GameCollection>
      },
    })
    t.field("franchise", {
      type: GameFranchiseGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_franchise",
          filters: [equality("id", root.franchise)],
        } as DomainQuery<DomainGameFranchise>) as Promise<GameFranchise>
      },
    })
    t.field("franchises", {
      type: list(GameFranchiseGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_franchise",
          filters: [equality("id", root.franchises)],
        } as DomainQuery<DomainGameFranchise>) as Promise<GameFranchise[]>
      },
    })
    t.field("artworks", {
      type: list(GameImageGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_artwork",
          filters: [equality("id", root.artworks)],
        } as DomainQuery<DomainGameArtwork>) as Promise<GameImage[]>
      },
    })
    t.field("genres", {
      type: list(GameGenreGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_genre",
          filters: [equality("id", root.genres)],
        } as DomainQuery<DomainGameGenre>) as Promise<GameGenre[]>
      },
    })
    t.field("keywords", {
      type: list(GameKeywordGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_keyword",
          filters: [equality("id", root.keywords)],
        } as DomainQuery<DomainGameKeyword>) as Promise<GameKeyword[]>
      },
    })
    t.field("multiplayerModes", {
      type: list(GameMultiplayerModeGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_multiplayer_mode",
          filters: [equality("id", root.multiplayerModes)],
        } as DomainQuery<DomainGameMultiplayerMode>) as Promise<
          GameMultiplayerMode[]
        >
      },
    })
    t.field("playerPerspective", {
      type: GamePlayerPerspectiveGraphType,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game_player_perspective",
          filters: [equality("id", root.playerPerspective)],
        } as DomainQuery<DomainGamePlayerPerspective>) as Promise<GamePlayerPerspective>
      },
    })
  },
})
