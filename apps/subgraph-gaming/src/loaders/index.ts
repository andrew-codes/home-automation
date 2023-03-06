import DataLoader from "dataloader"
import type { Db } from "mongodb"
import createGamesLoader from "./game"
import createGameReleasesLoader from "./gameReleases"
import createGenresLoader from "./genres"
import createPlatformsLoader from "./platforms"
import createSeriesLoader from "./series"
import createGameActivitiesLoader from "./activities"
import createGameAreasLoader from "./areas"

type Loaders = {
  gameAreas: DataLoader<string, any>
  gameActivities: DataLoader<string, any>
  games: DataLoader<string, any>
  gameReleases: DataLoader<string, any>
  genres: DataLoader<string, any>
  platforms: DataLoader<string, any>
  series: DataLoader<string, any>
}

const createLoader = async (db: Db): Promise<Loaders> => ({
  gameAreas: createGameAreasLoader(db),
  gameActivities: createGameActivitiesLoader(db),
  games: createGamesLoader(db),
  gameReleases: createGameReleasesLoader(db),
  genres: createGenresLoader(db),
  platforms: createPlatformsLoader(db),
  series: createSeriesLoader(db),
})

export default createLoader
export type { Loaders }
