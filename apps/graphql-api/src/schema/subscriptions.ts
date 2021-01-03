import createDebug from "debug"
import { list, stringArg, subscriptionField } from "nexus"
import { equality } from "../filter"
import { DomainGame, GameEntity } from "../Domain"
import { GameGraphType } from "./game"
import { pubsub } from "../pubsub"

const debug = createDebug("@ha/graphql-api/subscriptions")

// export const GamesSubscription = subscriptionField("gameLibrary", {
//   type: list(GameGraphType),
//   args: { ids: list(stringArg()) },
//   subscribe() {
//     return (async function* () {
//       const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
//         password: MQTT_PASSWORD,
//         port: parseInt(MQTT_PORT || "1883", 10),
//         username: MQTT_USERNAME,
//       })

//       await mqtt.subscribe("/playnite/game/list/updated")

//       while (true) {
//         await new Promise((resolve) => {
//           mqtt.on("message", (topic, message) => {
//             debug(topic, message.toString())
//             if (topic === "/playnite/game/list/updated") {
//               resolve(true)
//             }
//           })
//         })
//         yield true
//       }
//     })()
//   },
//   async resolve(root, args, ctx) {
//     let results = await ctx.query({
//       from: "game",
//       filters: args.ids?.map((id) => equality<DomainGame>("id", id)),
//     })
//     if (!Array.isArray(results)) {
//       results = [results]
//     }
//     return (results as Array<GameEntity | Error>).filter(
//       (result) => !(result instanceof Error)
//     ) as GameEntity[]
//   },
// })

export const GameStateSubscription = subscriptionField("gameState", {
  type: GameGraphType,
  subscribe() {
    return pubsub.asyncIterator("/playnite/game/state/updated")
  },
  resolve(root, args, ctx) {
    const { id } = root as { id: string }
    if (!id) {
      return null
    }
    debug(id)
    return ctx.query({
      from: "game",
      filters: [equality<DomainGame>("id", parseInt(id, 10))],
    })
  },
})
