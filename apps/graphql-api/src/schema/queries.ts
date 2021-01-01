import { intArg, list, queryField, stringArg } from "nexus"
import { equality } from "../filter"
import {
  Area,
  DomainArea,
  DomainEntityDomain,
  DomainGame,
  DomainGameFranchise,
  DomainGameGenre,
  DomainGameKeyword,
  DomainGameMode,
  DomainGamePlatform,
  DomainHomeAssistantEntity,
  GameEntity,
  GameFranchise,
  GameGenre,
  GameKeyword,
  GameMode,
  GamePlatform,
  HomeAssistantEntity,
} from "../Domain"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { AreaGraphType } from "./home_assistant_area"
import { DomainGraphType } from "./home_assistant_domain"
import {
  GameFranchiseGraphType,
  GameGenreGraphType,
  GameGraphType,
  GameKeywordGraphType,
  GameModeGraphType,
  GamePlatformGraphType,
} from "./game"

export const HAEntityQuery = queryField("entitiy", {
  type: list(HomeAssistantEntityGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "home_assistant_entity",
      filters: args.ids?.map((id) =>
        equality<DomainHomeAssistantEntity>("id", id)
      ),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<HomeAssistantEntity | Error>).filter(
      (result) => !(result instanceof Error)
    ) as HomeAssistantEntity[]
  },
})

export const AreaQuery = queryField("area", {
  type: list(AreaGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "area",
      filters: args.ids?.map((id) => equality<DomainArea>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<Area | Error>).filter(
      (result) => !(result instanceof Error)
    ) as Area[]
  },
})

export const DomainQuery = queryField("domain", {
  type: list(DomainGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "entity_domain",
      filters: args.ids?.map((id) => equality<DomainEntityDomain>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<HomeAssistantEntity | Error>).filter(
      (result) => !(result instanceof Error)
    ) as HomeAssistantEntity[]
  },
})

export const GameQuery = queryField("game", {
  type: list(GameGraphType),
  args: { ids: list(intArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game",
      filters: args.ids?.map((id) => equality<DomainGame>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GameEntity | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GameEntity[]
  },
})

export const GameGenreQuery = queryField("gameGenre", {
  type: list(GameGenreGraphType),
  args: { ids: list(intArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_genre",
      filters: args.ids?.map((id) => equality<DomainGameGenre>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GameGenre | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GameGenre[]
  },
})

export const GameFranchiseQuery = queryField("gameFranchise", {
  type: list(GameFranchiseGraphType),
  args: { ids: list(intArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_franchise",
      filters: args.ids?.map((id) => equality<DomainGameFranchise>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GameFranchise | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GameFranchise[]
  },
})

export const GameKeywordQuery = queryField("gameKeyword", {
  type: list(GameKeywordGraphType),
  args: { ids: list(intArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_keyword",
      filters: args.ids?.map((id) => equality<DomainGameKeyword>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GameKeyword | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GameKeyword[]
  },
})

export const GamePlatformQuery = queryField("gamePlatform", {
  type: list(GamePlatformGraphType),
  args: { ids: list(intArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_platform",
      filters: args.ids?.map((id) => equality<DomainGamePlatform>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GamePlatform | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GamePlatform[]
  },
})

export const GameModeQuery = queryField("gameMode", {
  type: list(GameModeGraphType),
  args: { ids: list(intArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_mode",
      filters: args.ids?.map((id) => equality<DomainGameMode>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GameMode | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GameMode[]
  },
})
