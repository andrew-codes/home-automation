import createDebug from "debug"
import { MongoClient } from "mongodb"
import { Domain } from "../../Domain"
import {
  equalityFilterApplicator,
  MongoDataQuery,
  MongoFilterApplicator,
  QueryMongo,
} from "./DataQuery"

const debug = createDebug("@ha/graphql-api/dataProvider/mongo")

const createMongoCollectionQuery = <TDomain extends Domain>(
  client: MongoClient,
  collection: string
) => {
  return {
    query: async (q) => {
      const db = await client.db("gameLibrary")
      const dataQuery = new MongoDataQuery<TDomain>(collection, [
        new MongoFilterApplicator(
          {
            equality: equalityFilterApplicator,
          },
          q
        ),
      ])
      const intermediateQuery = dataQuery.toDataQuery(q)
      const queryDatabase = new QueryMongo(db)
      return await queryDatabase.executeQuery(intermediateQuery)
    },
  }
}

export { createMongoCollectionQuery }
