import gameAttributes from "./gameAttributes"
import gameAssets from "./gameAssets"
import { MessageHandler } from "./types"

const handlers: MessageHandler[] = [gameAttributes, gameAssets]

export default handlers
