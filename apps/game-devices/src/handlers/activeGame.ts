import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"

const logger = createLogger()

const expr = /^playnite\/library\/game\/state$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {},
}

export default messageHandler
