import { keyBy, merge } from "lodash"
import CreateDataLoader from "./loader"
import DataLoader from "dataloader"

const createLoader: CreateDataLoader<any> = (db) => {
  return new DataLoader<string, any>(async (ids) => {
    const dbResults = await db
      .collection("series")
      .find({ id: { $in: ids } })
      .map((item) =>
        merge({}, item, {
          gameIds: item.gameIds ?? [],
        }),
      )
      .toArray()
    const results = keyBy(dbResults, "id")

    return ids.map((id) => results[id] || new Error(`No result for ${id}`))
  })
}

export default createLoader
