import createDebug from "debug"
import { DomainGame } from "../Domain"
import { IProvideData } from "./DataProvider"
import { createMongoCollectionQuery } from "./mongodb/queryMongoCollection"
import { UnsupportedDomainError } from "./Errors"

const debug = createDebug(
  "@ha/graphql-api/dataProvider/mongoCollectionDataProvider"
)

const createDataProvider = (domain, collectionName): IProvideData => {
  const canExecuteQuery = (query) => query.from === domain
  const mongoDbDataProvider = createMongoCollectionQuery<DomainGame>(
    collectionName
  )
  return {
    canExecuteQuery,
    query: async (q) => {
      if (!canExecuteQuery(q)) {
        throw new UnsupportedDomainError(q)
      }
      return mongoDbDataProvider.query(q)
    },
  }
}

export { createDataProvider }
