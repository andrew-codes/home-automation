import type { MessageHandler } from "./types"
import gameAttributes from "./gameAttributes"
import gameAssets from "./gameAssets"
import storePlayniteGames from "./storePlayniteGames"
import gameState from "./gameState"

const handlers: MessageHandler[] = [
  storePlayniteGames,
  gameAttributes,
  gameAssets,
  gameState,
]

export default handlers
