import { keyBy } from "lodash"
import CreateDataLoader from "./loader"
import DataLoader from "dataloader"

const createLoader: CreateDataLoader<any> = (db) => {
  return new DataLoader<string, any>(async (ids) => {
    const dbResults = await db
      .collection("gameAreas")
      .find({ id: { $in: ids } })
      .toArray()
    const results = keyBy(dbResults, "id")

    return ids.map((id) => results[id] || new Error(`No result for ${id}`))
  })
}

export default createLoader
