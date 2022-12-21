import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"
import { GridFSBucket } from "mongodb"
import { Readable } from "stream"

const logger = createLogger()

const expr = /^playnite\/library\/game\/(.*)\/attributes\/asset\/(.*)$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    try {
      logger.info(`Game covers handling topic: ${topic}`)
      const matches = topic.match(expr)
      if (!matches) {
        logger.debug(`No matches for topic ${topic}`)

        return
      }
      const gameId = matches[1]
      const assetId = matches[2]
      logger.debug(`Game ID: ${gameId} and asset ${assetId}`)
      const id = `${gameId}_${assetId}`

      const client = await getMongoDbClient()
      const db = await client.db("gameLibrary")

      logger.info("Createing GridFS Bucket")
      const bucket = new GridFSBucket(db, {
        bucketName: "assets",
      })
      const stream = new Readable()
      stream.on("end", () => {
        logger.info("Cover stream write ended.")
      })

      const s = stream.pipe(
        bucket.openUploadStream(id, {
          chunkSizeBytes: 1048576,
          metadata: { field: "gameId", value: gameId },
        }),
      )
      s.write(payload)
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
