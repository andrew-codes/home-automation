import gameAttributes from "./gameAttributes"
import gameCovers from "./gameCovers"
import { MessageHandler } from "./types"

const handlers: MessageHandler[] = [gameAttributes, gameCovers]

export default handlers
