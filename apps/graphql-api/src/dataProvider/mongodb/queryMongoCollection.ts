import createDebug from "debug"
import DataLoader from "dataloader"
import { flatten, isEmpty } from "lodash"
import { get } from "lodash/fp"
import { client } from "../../mongo"
import { Domain } from "../../Domain"
import {
  equalityFilterApplicator,
  MongoDataQuery,
  MongoFilterApplicator,
  QueryMongo,
} from "./DataQuery"

const debug = createDebug("@ha/graphql-api/dataProvider/mongo")

const createBatchFn = (collection) =>
  new DataLoader(async (ids) => {
    const db = await client.db("gameLibrary")
    return db
      .collection(collection)
      .find({ id: { $in: ids } })
      .toArray()
  })
const loadFns = {
  artworks: createBatchFn("artworks"),
  gameDetails: createBatchFn("gameDetails"),
  covers: createBatchFn("covers"),
  franchises: createBatchFn("franchises"),
  genres: createBatchFn("genres"),
  multiplayerMods: createBatchFn("multiplayerMods"),
  playerPerspectives: createBatchFn("playerPerspectives"),
  collections: createBatchFn("collections"),
  keywords: createBatchFn("keywords"),
  platforms: createBatchFn("platforms"),
}

const createMongoCollectionQuery = <TDomain extends Domain>(
  collection: string
) => {
  return {
    query: async (q) => {
      if (
        !isEmpty(q.filters) &&
        q.filters?.reduce(
          (acc, filter) => acc && filter.attribute === "id",
          true
        ) &&
        !!loadFns[collection]
      ) {
        if (q.filters.reduce((acc, f) => acc && !!f.value, true)) {
          if (q.filters.length > 1 || Array.isArray(q.filters[0].value)) {
            return loadFns[collection].loadMany(
              flatten(q.filters.map(get("value")))
            )
          }
          return loadFns[collection].load(q.filters[0].value)
        }
      }
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
      return queryDatabase.executeQuery(intermediateQuery)
    },
  }
}

export { createMongoCollectionQuery }
