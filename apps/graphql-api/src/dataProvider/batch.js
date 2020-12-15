import createDebug from "debug"
import DataLoader from "dataloader"
import { defaultTo, every, keyBy } from "lodash"
import { equality } from "../filter"

const debug = createDebug("@ha/graphql-api/data-provider/batch")
const shouldUseBatch = (query) => {
  return (
    !query.act &&
    !!query.filters &&
    query.filters.length === 1 &&
    query.filters[0].type === equality.type &&
    query.filters[0].attribute === "id"
  )
}

const createDataProvider = ({ loader, batchScheduleFn }) => {
  const dataLoaders = {}
  const getDataLoader = (query) => {
    const loaderKey = query.from
    if (!dataLoaders[loaderKey]) {
      const options = {}
      if (batchScheduleFn) {
        options.batchScheduleFn = batchScheduleFn
      }
      dataLoaders[loaderKey] = new DataLoader(async (ids) => {
        let results = await loader.query({
          from: query.from,
          filters: [equality.filter("id", ids)],
        })
        if (!Array.isArray(results)) {
          results = [results]
        }
        const resultsDictionary = keyBy(results, "id")
        return ids.map((id) => defaultTo(resultsDictionary[id], null))
      }, options)
    }
    return dataLoaders[loaderKey]
  }

  const query = async (q) => {
    if (shouldUseBatch(q)) {
      const dataLoader = getDataLoader(q)
      let results
      if (Array.isArray(q.filters[0].value)) {
        results = await Promise.all(
          q.filters[0].value.map((v) => dataLoader.load(v))
        )
      } else {
        results = await dataLoader.load(q.filters[0].value)
      }
      if (every(results, (result) => result === null)) {
        return []
      }
      return results
    }
    return loader.query(q)
  }

  return {
    query,
  }
}

export { createDataProvider }
