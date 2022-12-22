import fs from "fs/promises"
import path from "path"
import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"

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
      const assetFileName = matches[2]
      logger.info(`Game ID: ${gameId} and asset ${assetFileName}`)
      await fs.mkdir(path.join("/assets", gameId), { recursive: true })
      await fs.writeFile(
        path.join("/assets", gameId, assetFileName),
        payload,
        "binary",
      )
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
