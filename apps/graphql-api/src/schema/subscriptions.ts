import createDebug from "debug"
import { objectType, subscriptionField } from "nexus"
import { first } from "lodash"
import { equality } from "../filter"
import { DomainGame, DomainQuery, GameEntity } from "../Domain"
import { GameGraphType } from "./game"
import { pubsub } from "../pubsub"

const debug = createDebug("@ha/graphql-api/subscriptions")

export const UpdatedAtType = objectType({
  name: "UpdatedAt",
  definition(t) {
    t.string("updatedAt")
  },
})

export const GamesSubscription = subscriptionField("gameLibrary", {
  type: UpdatedAtType,
  subscribe() {
    return pubsub.asyncIterator("/playnite/game/list/updated")
  },
  resolve(root, args, ctx) {
    return { updatedAt: new Date().toISOString() }
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
      filters: [equality("playniteId", id)],
    } as DomainQuery<DomainGame>)) as GameEntity[]
    return first(results)
  },
})
