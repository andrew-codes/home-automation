import createDebug from "debug"
import { DomainGame, GameState } from "../Domain"
import { IProvideData } from "./DataProvider"
import { createDataProvider as createRedisDataProvider } from "./redisDataProvider"

const debug = createDebug("@ha/graphql-api/dataProvider/game")

const { REDIS_HOST, REDIS_PASSWORD } = process.env

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
    coverImage: gameItem.CoverImage as string,
    description: gameItem.Description as string,
    favorite: !!gameItem.Favorite,
    gameImagePath: gameItem.GameImagePath as string,
    hidden: !!gameItem.Hidden,
    id: gameItem.GameId as string,
    name: gameItem.Name as string,
    platformId: gameItem.Platform.Id as string,
    playtime: gameItem.Playtime as number,
    releaseYear: gameItem.ReleaseYear as number | null,
    sourceId: gameItem.Source.Id as string,
    state: getGameState(gameItem),
  }
}
const canExecuteQuery = (query) => query.from === "game"
const redisDataProvider = createRedisDataProvider({
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
})<DomainGame>("games", transformGame, canExecuteQuery)

const createDataProvider = (): IProvideData => {
  return redisDataProvider
}

export { createDataProvider }
