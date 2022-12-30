import { first, merge } from "lodash"
import { flow, filter, map, sortBy, orderBy, get } from "lodash/fp"

type GameRelease = {
  lastActivity: string
  description: string
  releaseYear: number
  releaseDate: string
}
type GameListGame = {
  id: string
  name: string
  coverImage: string
  backgroundImage: string
  platformReleases: GameRelease[]
}

const lastMonth = new Date(new Date().setDate(-30))
const mapGames = map<GameListGame, GameListGame>((game) =>
  merge({}, game, {
    platformReleases: flow(
      map((release: GameRelease) =>
        merge({}, release, {
          releaseDate: !!release.releaseDate
            ? new Date(Date.parse(release.releaseDate))
            : null,
          lastActivity: !!release.lastActivity
            ? new Date(Date.parse(release.lastActivity))
            : null,
        }),
      ),
      orderBy<GameRelease>([get("lastActivity")], ["desc"]),
    )(game.platformReleases),
  }),
)

const yearlyCollection = (releaseYear: number) => {
  return {
    name: releaseYear.toString(),
    filter: flow(
      filter<GameListGame>((game) =>
        game.platformReleases.some(
          (release) => release.releaseYear === releaseYear,
        ),
      ),

      mapGames,
      orderBy<GameListGame>(
        [(game) => first(game.platformReleases)?.lastActivity],
        ["desc"],
      ),
    ),
  }
}

const collections = [
  {
    name: "continue playing",
    filter: flow(
      filter<GameListGame>((game) =>
        game.platformReleases
          .map((release) => new Date(Date.parse(release.lastActivity)))
          .some((lastActivity) => lastActivity >= lastMonth),
      ),
      mapGames,
      orderBy<GameListGame>(
        [(game) => first(game.platformReleases)?.lastActivity],
        ["desc"],
      ),
    ),
  },
  yearlyCollection(2022),
  {
    name: "all",
    filter: flow(
      map<GameListGame, GameListGame>((game) =>
        merge({}, game, {
          platformReleases: sortBy(game.platformReleases)(
            (release) => release.lastActivity,
          ),
        }),
      ),
      sortBy((game) => game.name.toLowerCase()),
    ),
  },
]

export type { GameListGame }
export default collections
