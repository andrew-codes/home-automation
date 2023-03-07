import type { MessageHandler } from "./types"
import gameAttributes from "./gameAttributes"
import gameAssets from "./gameAssets"
import storePlayniteGames from "./storePlayniteGames"
import gameState from "./gameState"
import gameArea from "./gameArea"

const handlers: MessageHandler[] = [
  storePlayniteGames,
  gameAttributes,
  gameAssets,
  gameState,
  gameArea,
]

export default handlers
