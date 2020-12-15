import { get, keyBy } from "lodash/fp.js"
import { merge } from "lodash"

const createDataProvider = (dataProviders) => {
  return {
    query: async (q) => {
      const resultSets = await Promise.all(
        dataProviders.map((provider) => provider.query(q))
      )
      const resultDictionary = resultSets
        .map((resultSet) =>
          !Array.isArray(resultSet) ? [resultSet] : resultSet
        )
        .map(keyBy(get("id")))
        .reduce((acc, resultSet) => {
          return merge(acc, resultSet)
        }, {})
      return Object.values(resultDictionary)
    },
  }
}

export { createDataProvider }
