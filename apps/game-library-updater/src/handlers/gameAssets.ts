import fs from "fs/promises"
import { exists, existsSync } from "fs"
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
      const assetFileName = matches[2]
      logger.info(`Asset ID: ${assetFileName}`)
      const assetPath = path.join("/assets", assetFileName)
      if (existsSync(assetPath)) {
        throw new Error("File exists")
      }
      await fs.writeFile(assetPath, payload, "binary")
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
