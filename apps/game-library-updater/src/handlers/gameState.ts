import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"

const logger = createLogger()

const expr = /^playnite\/library\/game\/state$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Game state updates handling topic: ${topic}`)
    const gameStatePayload = JSON.parse(payload.toString())

    const client = await getMongoDbClient()
    const db = await client.db("gameLibrary")

    await db.collection("gameArea").updateOne(
      { _id: gameStatePayload.areaId },
      {
        $set: {
          gameId: gameStatePayload.id,
          gameState: gameStatePayload.state,
        },
      },
      { upsert: true },
    )
  },
}

export default messageHandler
