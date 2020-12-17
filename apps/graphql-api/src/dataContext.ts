import createDebug from "debug"
import { IProvideData } from "./dataProvider/DataProvider"
// import { createDataProvider as createAggregateDataProvider } from "./dataProvider/aggregateDataProvider"
import { createDataProvider as createSwitchDataProvider } from "./dataProvider/switchDataProvider"
import { createDataProvider as createHomeAssistantAPIEntityDataProvider } from "./dataProvider/homeAssistant/queryHomeAssistantEntities"
import { createDataProvider as createAreaConfigDataProvider } from "./dataProvider/configData/queryArea"
import { createDataProvider as createDomainConfigProvider } from "./dataProvider/configData/queryEntityDomain"
const debug = createDebug("@ha/graphql-api/dataContext")

export interface DataContext extends IProvideData {
  ha: any
}

const createDataContext = (ha): DataContext => {
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
    query: async (q) => {
      try {
        return dataProvider.query(q)
      } catch (error) {
        debug(error)
        return []
      }
    },
  }
}

export { createDataContext }
