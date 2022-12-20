import DataLoader from "dataloader"
import type { Db } from "mongodb"
import createGamesLoader from "./game"
import createGenresLoader from "./genres"
import createPlatformsLoader from "./platforms"
import createSeriesLoader from "./series"

type Loaders = {
  games: DataLoader<string, any>
  genres: DataLoader<string, any>
  platforms: DataLoader<string, any>
  series: DataLoader<string, any>
}

const createLoader = async (db: Db): Promise<Loaders> => ({
  games: createGamesLoader(db),
  genres: createGenresLoader(db),
  platforms: createPlatformsLoader(db),
  series: createSeriesLoader(db),
})

export default createLoader
export type { Loaders }
