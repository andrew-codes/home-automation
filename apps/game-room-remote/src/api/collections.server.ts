import { first, merge } from "lodash"
import { flow, filter, map, orderBy, get } from "lodash/fp"
import { Game, GameRelease } from "../Game"
import { GameCollectionDefinition } from "../GameCollection"

const lastMonth = new Date(new Date().setDate(-30))
const mapGames = map<Game, Game>((game) =>
  merge({}, game, {
    releases: orderBy<GameRelease>(
      [get("lastActivity"), get("releaseDate")],
      ["desc", "desc"],
    )(game.releases),
  }),
)

const yearlyCollection = (releaseYear: number) => {
  return {
    id: `yearly-collection-${releaseYear}`,
    name: releaseYear.toString(),
    filter: flow(
      filter<Game>((game) =>
        game.releases.some((release) => release.releaseYear === releaseYear),
      ),

      mapGames,
      orderBy<Game>([(game) => first(game.releases)?.lastActivity], ["desc"]),
    ),
  }
}

const collectionDefinitions: Omit<
  GameCollectionDefinition,
  "currentPageIndex" | "countPerPage"
>[] = [
  {
    id: "continue-playing",
    name: "continue playing",
    filter: flow(
      filter<Game>((game) =>
        game.releases.some(
          ({ lastActivity }) => !!lastActivity && lastActivity >= lastMonth,
        ),
      ),
      mapGames,
      orderBy<Game>([(game) => first(game.releases)?.lastActivity], ["desc"]),
    ),
  },
  yearlyCollection(2022),
  {
    id: "all",
    name: "all",
    filter: flow(mapGames, orderBy([get("name")], ["asc"])),
  },
]

export default collectionDefinitions
