import {
  cond,
  concat,
  drop,
  take,
  flow,
  get,
  filter,
  map,
  merge,
  stubTrue,
} from "lodash/fp"
import { PreparedMedia } from "../../components/PreparedMedia/types"

const getMediaToPrepare = (
  target: "primary" | "secondary" | false,
  gameIndex: number,
  countPerPage: number,
  gamePageIndex: number,
  items: any[],
  coverDimensions: { width: number; height: number },
  backgroundDimensions: { width?: number; height: number },
): PreparedMedia[] => {
  const getRelevantGames = flow(
    drop(gamePageIndex * countPerPage),
    take(countPerPage),
  )
  const getCovers = flow(
    filter(get("coverImage")),
    map((game) => ({
      url: `${game.coverImage}?height=${coverDimensions.height}&width=${coverDimensions.width}`,
      mode: game.mode,
    })),
  )
  const getBackgrounds = flow(
    filter(get("backgroundImage")),
    map((game) => ({
      url: `${game.backgroundImage}?height=${backgroundDimensions.height}${
        backgroundDimensions.width ? `&width=${backgroundDimensions.width}` : ""
      }`,
      mode: game.mode,
    })),
  )

  const getRelevantGamesForCover = flow(
    getRelevantGames,
    cond([
      [
        () => target === "primary",
        map((game) => merge(game, { mode: "preload" })),
      ],
      [
        () => target === "secondary",
        flow(
          drop(gameIndex - 0),
          take(countPerPage),
          map((game) => merge(game, { mode: "prefetch" })),
        ),
      ],
      [stubTrue, () => []],
    ]),
  )

  const getRelevantGamesForBackground = flow(
    getRelevantGames,
    cond([
      [
        () => target === "primary",
        (games) => {
          const getPreloadMedia = flow(
            filter((_, index) => index === gameIndex),
            map((game) => merge(game, { mode: "preload" })),
          )
          const getPrefetchMedia = flow(
            filter((_, index) => index !== gameIndex),
            map((game) => merge(game, { mode: "prefetch" })),
          )

          return flow(
            concat(getPreloadMedia(games)),
            concat(getPrefetchMedia(games)),
          )([])
        },
      ],
      [
        () => target === "secondary",
        flow(
          drop(gameIndex - 0),
          take(1),
          map((game) => merge(game, { mode: "prefetch" })),
        ),
      ],
      [stubTrue, () => []],
    ]),
  )

  const covers = getRelevantGamesForCover(items)
  const backgrounds = getRelevantGamesForBackground(items)

  const list = flow(
    concat(getCovers(covers)),
    concat(getBackgrounds(backgrounds)),
  )([])

  return list
}

export { getMediaToPrepare }
