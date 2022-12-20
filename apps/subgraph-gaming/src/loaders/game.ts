import { merge } from "lodash"
import CreateDataLoader from "./loader"
import DataLoader from "dataloader"

const createLoader: CreateDataLoader<any> = (db) => {
  return new DataLoader<string, any>((ids) => {
    return db
      .collection("games")
      .find({ _id: { $in: ids } })
      .map((item) =>
        merge({}, item, {
          genreIds: item.genreIds ?? [],
          platformIds: item.platformIds ?? [],
          seriesIds: item.seriesIds ?? [],
          releaseDate:
            item.releaseDate !== null
              ? Date.parse(item.releaseDate?.releaseDate).toString()
              : null,
        }),
      )
      .toArray()
  })
}

export default createLoader
