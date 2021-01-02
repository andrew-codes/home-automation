import createDebug from "debug"
import { client } from "../mongo"
import { DomainGame, GameState } from "../Domain"
import { IProvideData } from "./DataProvider"
import { createMongoCollectionQuery } from "./mongodb/queryMongoCollection"
import { UnsupportedDomainError } from "./Errors"

const debug = createDebug("@ha/graphql-api/dataProvider/game")

const getGameState = (gameItem): GameState => {
  if (gameItem.isInstalled) {
    return "Installed"
  }
  if (gameItem.isInstalling) {
    return "Installing"
  }
  if (gameItem.isUninstalling) {
    return "Uninstalling"
  }
  if (gameItem.isLaunching) {
    return "Launching"
  }
  if (gameItem.isRunning) {
    return "Running"
  }
  return "Not Installed"
}
const transformGame = (gameItem) => ({
  ...gameItem,
  state: getGameState(gameItem),
})
const canExecuteQuery = (query) => query.from === "game"
const mongoDbDataProvider = createMongoCollectionQuery<DomainGame>(
  "gameDetails"
)

const createDataProvider = (): IProvideData => {
  return {
    canExecuteQuery,
    query: async (q) => {
      if (!canExecuteQuery(q)) {
        throw new UnsupportedDomainError(q)
      }
      const results = await mongoDbDataProvider.query(q)
      if (Array.isArray(results)) {
        return results.map(transformGame)
      }
      return transformGame(results)
    },
  }
}

export { createDataProvider }
