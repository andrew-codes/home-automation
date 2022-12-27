import type { MessageHandler } from "./types"
import gameAttributes from "./gameAttributes"
import gameAssets from "./gameAssets"
import storePlayniteGames from "./storePlayniteGames"

const handlers: MessageHandler[] = [
  storePlayniteGames,
  gameAttributes,
  gameAssets,
]

export default handlers
