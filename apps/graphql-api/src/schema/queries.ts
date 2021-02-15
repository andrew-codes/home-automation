import { arg, inputObjectType, list, queryField, stringArg } from "nexus"
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
  DomainQuery,
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
import { OrderByType } from "./orderBy"

export const HAEntityQuery = queryField("entitiy", {
  type: list(HomeAssistantEntityGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "home_assistant_entity",
      filters: args.ids?.map((id) =>
        equality<DomainHomeAssistantEntity>("id", id)
      ),
    } as DomainQuery<DomainHomeAssistantEntity>)
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
    } as DomainQuery<DomainArea>)
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<Area | Error>).filter(
      (result) => !(result instanceof Error)
    ) as Area[]
  },
})

export const HADomainQuery = queryField("domain", {
  type: list(DomainGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "entity_domain",
      filters: args.ids?.map((id) => equality<DomainEntityDomain>("id", id)),
    } as DomainQuery<DomainEntityDomain>)
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<HomeAssistantEntity | Error>).filter(
      (result) => !(result instanceof Error)
    ) as HomeAssistantEntity[]
  },
})

export const OrderGameBy = inputObjectType({
  name: "OrderByArg",
  definition(t) {
    t.field("name", { type: OrderByType })
    t.field("releaseYear", { type: OrderByType })
  },
})

export const GameQuery = queryField("game", {
  type: list(GameGraphType),
  args: { ids: list(stringArg()), orderBy: arg({ type: OrderGameBy }) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game",
      filters: (args.ids as string[] | null)?.map((id) =>
        equality("id", parseInt(id, 10))
      ),
      orderBy: args.orderBy,
    } as DomainQuery<DomainGame>)
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
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_genre",
      filters: (args.ids as string[] | null)?.map((id) =>
        equality("id", parseInt(id, 10))
      ),
    } as DomainQuery<DomainGameGenre>)
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
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_franchise",
      filters: (args.ids as string[] | null)?.map((id) =>
        equality<DomainGameFranchise>("id", parseInt(id, 10))
      ),
    } as DomainQuery<DomainGameFranchise>)
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
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_keyword",
      filters: (args.ids as string[] | null)?.map((id: string) =>
        equality<DomainGameKeyword>("id", parseInt(id, 10))
      ),
    } as DomainQuery<DomainGameKeyword>)
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
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_platform",
      filters: (args.ids as string[] | null)?.map((id: string) =>
        equality<DomainGamePlatform>("id", id)
      ),
    } as DomainQuery<DomainGamePlatform>)
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
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "game_mode",
      filters: (args.ids as string[] | null)?.map((id) =>
        equality<DomainGameMode>("id", parseInt(id, 10))
      ),
    } as DomainQuery<DomainGameMode>)
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<GameMode | Error>).filter(
      (result) => !(result instanceof Error)
    ) as GameMode[]
  },
})
