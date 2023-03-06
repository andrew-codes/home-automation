import { flow, get, startCase, toLower } from "lodash/fp"
import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"

const logger = createLogger()

const expr = /^playnite\/library\/area\/config$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Game area configuration for: ${topic}`)
    const parsedPayload = JSON.parse(payload.toString())

    const client = await getMongoDbClient()
    const db = await client.db("gameLibrary")

    const name = flow(toLower, startCase)(parsedPayload.id.split("_").join(" "))

    await db.collection("gameAreas").updateOne(
      { _id: parsedPayload.id },
      {
        $set: {
          id: parsedPayload.id,
          name,
        },
      },
      { upsert: true },
    )

    const platforms = await db
      .collection("platforms")
      .find({
        name: {
          $regex: `${parsedPayload.supportedPlatforms
            .map((platform) => `(${platform})`)
            .join("|")}`,
        },
      })
      .map(get("id"))
      .toArray()

    await Promise.all(
      platforms.map(async (platformId) => {
        const id = `${parsedPayload.id}_${platformId}`

        return await db
          .collection("gameAreasPlatforms")
          .updateOne(
            { _id: id as any },
            { $set: { id, areaId: parsedPayload.id, platformId } },
            { upsert: true },
          )
      }),
    )
  },
}

export default messageHandler
