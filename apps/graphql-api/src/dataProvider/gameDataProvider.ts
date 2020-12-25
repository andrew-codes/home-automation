import createDebug from "debug"
import { client } from "../mongo"
import { DomainGame, GameState } from "../Domain"
import { IProvideData } from "./DataProvider"
import { createMongoCollectionQuery } from "./mongodb/queryMongoCollection"
import { UnsupportedDomainError } from "./Errors"

const debug = createDebug("@ha/graphql-api/dataProvider/game")

const getGameState = (gameItem): GameState => {
  if (gameItem.IsInstalled) {
    return "Installed"
  }
  if (gameItem.IsInstalling) {
    return "Installing"
  }
  if (gameItem.IsUninstalling) {
    return "Uninstalling"
  }
  if (gameItem.IsLaunching) {
    return "Launching"
  }
  if (gameItem.IsRunning) {
    return "Running"
  }
  return "Not Installed"
}
const transformGame = (gameItem, index, list) => {
  if (index === 0) {
    debug(gameItem)
  }

  return {
    ...gameItem,
    state: getGameState(gameItem),
  }
}
const canExecuteQuery = (query) => query.from === "game"
const mongoDbDataProvider = createMongoCollectionQuery<DomainGame>(
  client,
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
      return results.map(transformGame)
    },
  }
}

export { createDataProvider }
