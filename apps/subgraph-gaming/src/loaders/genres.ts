import { merge } from "lodash"
import CreateDataLoader from "./loader"
import DataLoader from "dataloader"

const createLoader: CreateDataLoader<any> = (db) => {
  return new DataLoader<string, any>((ids) => {
    return db
      .collection("genres")
      .find({ _id: { $in: ids } })
      .map((item) =>
        merge({}, item, {
          itemIds: item.gameIds ?? [],
        }),
      )
      .toArray()
  })
}

export default createLoader
