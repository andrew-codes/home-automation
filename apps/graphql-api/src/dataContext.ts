import createDebug from "debug"
import { IProvideData } from "./dataProvider/DataProvider"
import { createDataProvider as batchedDataProvider } from "./dataProvider/batchDataProvider"
import { createDataProvider as createAggregateDataProvider } from "./dataProvider/aggregateDataProvider"
import { createDataProvider as createHomeAssistantAPIEntityDataProvider } from "./dataProvider/homeAssistant/queryHomeAssistantEntities"
import { createDataProvider as createAreaConfigDataProvider } from "./dataProvider/configData/queryArea"
import { createDataProvider as createDomainConfigProvider } from "./dataProvider/configData/queryEntityDomain"
const debug = createDebug("@ha/graphql-api/dataContext")

export interface DataContext extends IProvideData {
  ha: any
}

const createDataContext = (ha): DataContext => {
  const areaConfigProvider = createAreaConfigDataProvider()
  const batchedAreaConfigProvider = batchedDataProvider(areaConfigProvider)

  const haEntityAPIProvider = createHomeAssistantAPIEntityDataProvider(
    ha,
    batchedAreaConfigProvider
  )
  const batchedHaEntityAPIProvider = batchedDataProvider(haEntityAPIProvider)

  const domainConfigProvider = createDomainConfigProvider()
  const batchedDomainConfigProvider = batchedDataProvider(domainConfigProvider)

  const dataProvider = createAggregateDataProvider([
    batchedAreaConfigProvider,
    batchedHaEntityAPIProvider,
    batchedDomainConfigProvider,
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
