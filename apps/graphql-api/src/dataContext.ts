import createDebug from "debug"
import { AsyncClient } from "async-mqtt"
import { createDataProvider as createAreaConfigDataProvider } from "./dataProvider/configData/queryArea"
import { createDataProvider as createDomainConfigProvider } from "./dataProvider/configData/queryEntityDomain"
import { createDataProvider as createHomeAssistantAPIEntityDataProvider } from "./dataProvider/homeAssistant/queryHomeAssistantEntities"
import { createDataProvider as createGameDataProvider } from "./dataProvider/gameDataProvider"
import { createDataProvider as createMongoCollectionDataProvider } from "./dataProvider/mongoCollectionDataProvider"
import { createDataProvider as createSwitchDataProvider } from "./dataProvider/switchDataProvider"

import { IProvideData } from "./dataProvider/DataProvider"
const debug = createDebug("@ha/graphql-api/dataContext")

export interface DataContext extends IProvideData {
  ha: any
  mqtt: AsyncClient
  unifi: any
}

const createDataContext = (ha, mqtt: AsyncClient, unifi): DataContext => {
  const areaConfigProvider = createAreaConfigDataProvider()
  const haEntityAPIProvider = createHomeAssistantAPIEntityDataProvider()
  const domainConfigProvider = createDomainConfigProvider()
  const gameProvider = createGameDataProvider()

  // For when there are multiple providers for a single domain
  // const domainProvider = createAggregateDataProvider([
  //   domainConfigProvider,
  //   domainConfigProvider,
  // ])
  const dataProvider = createSwitchDataProvider([
    areaConfigProvider,
    haEntityAPIProvider,
    domainConfigProvider,
    gameProvider,
    createMongoCollectionDataProvider("game_cover", "covers"),
    createMongoCollectionDataProvider("game_artwork", "artworks"),
    createMongoCollectionDataProvider("game_genre", "genres"),
    createMongoCollectionDataProvider("game_collection", "collections"),
    createMongoCollectionDataProvider("game_franchise", "franchises"),
    createMongoCollectionDataProvider(
      "game_multiplayer_mode",
      "multiplayerModes"
    ),
    createMongoCollectionDataProvider(
      "game_player_perspective",
      "playerPerspectives"
    ),
    createMongoCollectionDataProvider("game_keyword", "keywords"),
    createMongoCollectionDataProvider("game_platform", "platforms"),
  ])

  return {
    ha,
    mqtt,
    unifi,
    canExecuteQuery: dataProvider.canExecuteQuery,
    query: async (q) => {
      try {
        const results = dataProvider.query(q)
        return results
      } catch (error) {
        debug(error)
        return []
      }
    },
  }
}

export { createDataContext }
