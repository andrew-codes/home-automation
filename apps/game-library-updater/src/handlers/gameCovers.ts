import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"
import { GridFSBucket } from "mongodb"
import { Readable } from "stream"

const logger = createLogger()

const expr = /^playnite\/library\/game\/(.*)\/attributes\/cover$/

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
      logger.debug(`Game ID: ${gameId}`)

      const client = await getMongoDbClient()
      const db = await client.db("gameLibrary")

      logger.info("Createing GridFS Bucket")
      const bucket = new GridFSBucket(db, {
        bucketName: "covers",
      })
      const stream = new Readable()
      stream.on("end", () => {
        logger.info("Cover stream write ended.")
      })

      stream.push(payload)
      stream.push(null)
      stream
        .pipe(
          bucket.openUploadStream("cover.png", {
            chunkSizeBytes: 1048576,
            metadata: { field: "gameId", value: gameId },
          }),
        )
        .end()
    } catch (error) {
      logger.error(error)
    }
  },
}
export default messageHandler
