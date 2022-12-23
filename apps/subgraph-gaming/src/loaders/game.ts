import { keyBy, merge } from "lodash"
import CreateDataLoader from "./loader"
import DataLoader from "dataloader"

const createLoader: CreateDataLoader<any> = (db) => {
  return new DataLoader<string, any>(async (ids) => {
    const dbResults = await db
      .collection("games")
      .find({ id: { $in: ids } })
      .map((item) =>
        merge({}, item, {
          genreIds: item.genreIds ?? [],
          platformReleaseIds: item.platformReleaseIds ?? [],
          seriesIds: item.seriesIds ?? [],
          releaseDate:
            item.releaseDate !== null
              ? Date.parse(item.releaseDate?.releaseDate).toString()
              : null,
        }),
      )
      .toArray()
    const results = keyBy(dbResults, "id")

    return ids.map((id) => results[id] || new Error(`No result for ${id}`))
  })
}

export default createLoader
