import createDebug from "debug"
import { AsyncClient } from "async-mqtt"
import { IProvideData } from "./dataProvider/DataProvider"
// import { createDataProvider as createAggregateDataProvider } from "./dataProvider/aggregateDataProvider"
import { createDataProvider as createSwitchDataProvider } from "./dataProvider/switchDataProvider"
import { createDataProvider as createHomeAssistantAPIEntityDataProvider } from "./dataProvider/homeAssistant/queryHomeAssistantEntities"
import { createDataProvider as createAreaConfigDataProvider } from "./dataProvider/configData/queryArea"
import { createDataProvider as createDomainConfigProvider } from "./dataProvider/configData/queryEntityDomain"
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

  // For when there are multiple providers for a single domain
  // const domainProvider = createAggregateDataProvider([
  //   domainConfigProvider,
  //   domainConfigProvider,
  // ])
  const dataProvider = createSwitchDataProvider([
    areaConfigProvider,
    haEntityAPIProvider,
    domainConfigProvider,
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
