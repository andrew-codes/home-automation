import { flow, map } from "lodash/fp"
import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"

const logger = createLogger()

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => /^playnite\/library\/games\/attributes$/.test(topic),
  handle: async (topic, payload) => {
    logger.info(
      `Game attributes handling topic to store playnite game data: ${topic}`,
    )
    const deserializedGames = flow(JSON.parse)(payload.toString())

    const client = await getMongoDbClient()
    const db = await client.db("gameLibrary")
    const dbInserts = flow(
      map<any, Promise<any>>(async (item) => {
        logger.debug(`Collection playniteGames; Updating item ${item.Id}`, {
          item,
        })

        return await db
          .collection("playniteGames")
          .updateOne({ _id: item.Id }, { $set: item }, { upsert: true })
      }),
    )

    await Promise.all(dbInserts(deserializedGames))
  },
}
export default messageHandler
