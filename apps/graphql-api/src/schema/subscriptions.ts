import createDebug from "debug"
import { list, stringArg, subscriptionField } from "nexus"
import { first } from "lodash"
import { equality } from "../filter"
import { DomainGame, GameEntity } from "../Domain"
import { GameGraphType } from "./game"
import { pubsub } from "../pubsub"

const debug = createDebug("@ha/graphql-api/subscriptions")

export const GamesSubscription = subscriptionField("gameLibrary", {
  type: list(GameGraphType),
  args: { ids: list(stringArg()) },
  subscribe() {
    return pubsub.asyncIterator("/playnite/game/list/updated")
  },
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

export const GameStateSubscription = subscriptionField("gameState", {
  type: GameGraphType,
  subscribe() {
    return pubsub.asyncIterator("/playnite/game/state/updated")
  },
  async resolve(root, args, ctx) {
    const { id } = root as { id: string }
    if (!id) {
      return null
    }
    const results = (await ctx.query({
      from: "game",
      filters: [equality<DomainGame>("playniteId", id)],
    })) as GameEntity[]
    return first(results)
  },
})
