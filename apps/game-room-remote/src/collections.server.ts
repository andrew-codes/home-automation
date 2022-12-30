import { first, merge } from "lodash"
import { flow, filter, map, sortBy } from "lodash/fp"

type GameListGame = {
  id: string
  name: string
  coverImage: string
  backgroundImage: string
  platformReleases: {
    lastActivity: string
    description: string
  }[]
}

const lastMonth = new Date(new Date().setDate(-30))

const collections = {
  "recently played": flow(
    filter<GameListGame>((game) =>
      game.platformReleases
        .map((release) => new Date(Date.parse(release.lastActivity)))
        .some((lastActivity) => lastActivity >= lastMonth),
    ),
    map<GameListGame, GameListGame>((game) =>
      merge({}, game, {
        platformReleases: sortBy(game.platformReleases)(
          (release) => release.lastActivity,
        ),
      }),
    ),
    sortBy((game) => first(game.platformReleases)),
  ),
  all: flow(
    map<GameListGame, GameListGame>((game) =>
      merge({}, game, {
        platformReleases: sortBy(game.platformReleases)(
          (release) => release.lastActivity,
        ),
      }),
    ),
    sortBy((game) => game.name.toLowerCase()),
  ),
  al2: flow(
    map<GameListGame, GameListGame>((game) =>
      merge({}, game, {
        platformReleases: sortBy(game.platformReleases)(
          (release) => release.lastActivity,
        ),
      }),
    ),
    sortBy((game) => game.name.toLowerCase()),
  ),
  al3: flow(
    map<GameListGame, GameListGame>((game) =>
      merge({}, game, {
        platformReleases: sortBy(game.platformReleases)(
          (release) => release.lastActivity,
        ),
      }),
    ),
    sortBy((game) => game.name.toLowerCase()),
  ),
}

export type { GameListGame }
export default collections
