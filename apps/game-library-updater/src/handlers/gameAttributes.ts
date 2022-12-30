import {
  concat,
  entries,
  filter,
  flatten,
  flow,
  get,
  groupBy,
  identity,
  join,
  map,
  mergeWith,
  omit,
  pick,
  reduce,
  sortBy,
  tap,
  uniqBy,
  values,
  zipObject,
} from "lodash/fp"
import { first, isEmpty, last, merge } from "lodash"
import { createLogger } from "@ha/logger"
import { formatKeys } from "@ha/string-utils"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"

const logger = createLogger()

const customizer = (objValue, srcValue) => {
  let src = srcValue
  if (!Array.isArray(srcValue)) {
    src = [srcValue]
  }

  let obj = objValue
  if (!Array.isArray(objValue)) {
    obj = [objValue]
  }

  return obj.concat(src)
}

const toAssetId = (asset: string) => (!!asset ? last(asset.split("\\")) : null)

const foreignKeys = [
  "genres",
  "developers",
  "publishers",
  "features",
  "series",
  "ageRatings",
  "source",
  "completionStatus",
  "platforms",
]
const toUniqueRelations = flow(
  map(pick(foreignKeys)),
  reduce(mergeWith(customizer), {}),
  entries,
  map(get(1)),
  map(filter(identity)),
  map(uniqBy("id")),
)

const toGameId = flow(map(get("id")), sortBy(identity), join("_"))
const filterWithoutPlatform = filter((game: any) => !isEmpty(game.platformIds))

const toGames = flow(
  filterWithoutPlatform,
  map(
    pick([
      "id",
      "backgroundImage",
      "coverImage",
      "gameId",
      "genreIds",
      "icon",
      "name",
      "platformIds",
      "seriesIds",
    ]),
  ),
  map((game) =>
    merge({}, game, {
      backgroundImage: toAssetId(game.backgroundImage),
      coverImage: toAssetId(game.coverImage),
      icon: toAssetId(game.icon),
    }),
  ),
  groupBy(get("name")),
  values,
  map((groupedGames) => {
    const id = toGameId(groupedGames)
    return merge({}, first(groupedGames), {
      id,
      platformReleaseIds: groupedGames.map(
        (game) => `${first(game.platformIds)}_${id}`,
      ),
    })
  }),
  map(omit(["platformIds", "gameId"])),
)

const toGameReleases = (games) =>
  flow(
    filterWithoutPlatform,
    map(
      pick([
        "added",
        "communityScore",
        "criticScore",
        "description",
        "gameId",
        "id",
        "isInstalled",
        "isInstalling",
        "isLaunching",
        "isRunning",
        "isUninstalling",
        "lastActivity",
        "name",
        "platformIds",
        "playCount",
        "playtime",
        "releaseDate",
        "releaseYear",
        "sourceId",
      ]),
    ),
    map((game) => {
      const gameId = games.find((g) => g.name === game.name).id
      const platformId = first(game.platformIds)

      return merge({}, game, {
        id: `${platformId}_${gameId}`,
        playniteId: game.id,
        playId: game.gameId,
        gameId,
        platformId,
        added: new Date(Date.parse(game.added)),
        lastActivity: new Date(Date.parse(game.lastActivity)),
        releaseDate: !!game?.releaseDate?.releaseDate
          ? new Date(Date.parse(game?.releaseDate?.releaseDate))
          : null,
      })
    }),
    map(omit(["name", "platformIds"])),
  )

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => /^playnite\/library\/games\/attributes$/.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Game attributes handling topic: ${topic}`)
    const deserializedGames = flow(JSON.parse, formatKeys)(payload.toString())
    // logger.debug("Deserialized games", { games: deserializedGames })

    const games = toGames(deserializedGames)
    const gameReleases = toGameReleases(games)(deserializedGames)
    const prepareForDbInsert = flow(
      toUniqueRelations,
      concat([games, gameReleases]),
      zipObject(["games", "gameReleases"].concat(foreignKeys)),
      entries,
      reduce((acc, [key, values]) => {
        if (key === "games" || key === "gameReleases") {
          return acc.concat([[key, values]])
        }

        const valuesWithInverseGameRelation =
          values?.map((value) =>
            merge({}, value, {
              gameIds: games
                .filter((game) => {
                  if (Array.isArray(game[key])) {
                    return game[key].find((k) => k.id === value.id)
                  } else {
                    return game[`${key}Id`] === value.id
                  }
                })
                .map((game) => game.id),
            }),
          ) ?? []

        return acc.concat([[key, valuesWithInverseGameRelation]])
      }, [] as [string, any[]][]),
    )

    const client = await getMongoDbClient()
    const db = await client.db("gameLibrary")
    const dbInserts = flow(
      prepareForDbInsert,
      tap((data) => {
        logger.debug(JSON.stringify(data))
      }),
      map(([key, value]) =>
        map(async (item: any) => {
          logger.debug(`Collection ${key}; Updating item ${item.id}`, {
            item,
          })
          return await db
            .collection(key)
            .updateOne({ _id: item.id }, { $set: item }, { upsert: true })
        })(value),
      ),
      flatten,
    )

    await Promise.all(dbInserts(deserializedGames))
  },
}
export default messageHandler
