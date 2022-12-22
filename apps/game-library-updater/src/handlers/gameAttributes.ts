import {
  concat,
  entries,
  flatten,
  filter,
  flow,
  get,
  identity,
  map,
  mergeWith,
  pick,
  reduce,
  tap,
  uniqBy,
  zipObject,
} from "lodash/fp"
import { merge } from "lodash"
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

const assetIdRegExpression = /.*\\\\?(.*)$/
const toAssetId = (id: string, asset: string) => {
  const matches = asset.match(assetIdRegExpression)
  if (!matches?.[1]) {
    throw new Error("Cannot extract asset ID.")
  }

  return `${id}_${matches[1]}`
}

const toGames = flow(
  map((game) =>
    merge(game, {
      _id: game.id,
      backgroundImage: toAssetId(game.id, game.backgroundImage),
      coverImage: toAssetId(game.id, game.coverImage),
      icon: toAssetId(game.id, game.icon),
    }),
  ),
)
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
const toNonForeignKeys = flow(
  get(0),
  entries,
  map(get(0)),
  filter((key) => !foreignKeys.includes(key)),
)
const toUniqueRelations = flow(
  map(pick(foreignKeys)),
  reduce(mergeWith(customizer), {}),
  entries,
  map(get(1)),
  map(filter(identity)),
  map(uniqBy("id")),
)

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => /^playnite\/library\/games\/attributes$/.test(topic),
  handle: async (topic, payload) => {
    try {
      logger.info(`Game attributes handling topic: ${topic}`)
      const deserializedGames = flow(JSON.parse, formatKeys)(payload.toString())
      logger.debug("Deserialized games", { games: deserializedGames })
      const games = toGames(deserializedGames)

      const nonForeignKeys = toNonForeignKeys(games)
      const toGamesWithoutForeignKeys = flow(map(pick(nonForeignKeys)))

      const gamesWithoutRelations = toGamesWithoutForeignKeys(games)
      const prepareForDbInsert = flow(
        toUniqueRelations,
        concat([gamesWithoutRelations]),
        zipObject(["games"].concat(foreignKeys)),
        entries,
        reduce((acc, [key, values]) => {
          if (key === "games") {
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
        }, []),
      )

      const client = await getMongoDbClient()
      const db = await client.db("gameLibrary")
      const dbInserts = flow(
        prepareForDbInsert,
        tap((data) => {
          logger.debug(JSON.stringify(data))
        }),
        map(([key, value]) =>
          map(async (item) => {
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

      await Promise.all(dbInserts(games))
    } catch (error) {
      logger.error(`DB Game update Error`, error)
    }
  },
}
export default messageHandler
