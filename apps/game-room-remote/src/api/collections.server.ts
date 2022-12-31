import { first, merge } from "lodash"
import { flow, filter, map, orderBy, get } from "lodash/fp"
import { Game, GameRelease } from "../Game"

const lastMonth = new Date(new Date().setDate(-30))
const mapGames = map<Game, Game>((game) =>
  merge({}, game, {
    platformReleases: orderBy<GameRelease>(
      [get("lastActivity"), get("releaseDate")],
      ["desc", "desc"],
    )(game.platformReleases),
  }),
)

const yearlyCollection = (releaseYear: number) => {
  return {
    name: releaseYear.toString(),
    filter: flow(
      filter<Game>((game) =>
        game.platformReleases.some(
          (release) => release.releaseYear === releaseYear,
        ),
      ),

      mapGames,
      orderBy<Game>(
        [(game) => first(game.platformReleases)?.lastActivity],
        ["desc"],
      ),
    ),
  }
}

const collectionDefinitions = [
  {
    name: "continue playing",
    filter: flow(
      filter<Game>((game) =>
        game.platformReleases.some(
          ({ lastActivity }) => !!lastActivity && lastActivity >= lastMonth,
        ),
      ),
      mapGames,
      orderBy<Game>(
        [(game) => first(game.platformReleases)?.lastActivity],
        ["desc"],
      ),
    ),
  },
  yearlyCollection(2022),
  {
    name: "all",
    filter: flow(mapGames, orderBy([get("name")], ["asc"])),
  },
].map((collectionDefintion) =>
  merge({}, collectionDefintion, { currentViewIndex: 0, countPerView: 7 }),
)

export default collectionDefinitions
