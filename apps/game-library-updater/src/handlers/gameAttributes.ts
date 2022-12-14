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

const toGames = flow(map((game) => merge(game, { _id: game.id })))
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
      logger.debug(`Payload:
${deserializedGames}`)
      const games = toGames(deserializedGames)
      logger.debug(`Games in payload:
${JSON.stringify(games, null, 2)}`)

      const nonForeignKeys = toNonForeignKeys(games)
      const toGamesWithoutForeignKeys = flow(map(pick(nonForeignKeys)))

      const gamesWithoutRelations = toGamesWithoutForeignKeys(games)
      const prepareForDbInsert = flow(
        toUniqueRelations,
        concat([gamesWithoutRelations]),
        zipObject(["games"].concat(foreignKeys)),
        entries,
      )

      const client = await getMongoDbClient()
      const db = await client.db("gameLibrary")
      const dbInserts = flow(
        prepareForDbInsert,
        map(([key, value]) =>
          map((item) => {
            logger.debug(
              `Updating item ${item.id};
${JSON.stringify(item, null, 2)}`,
            )
            return db
              .collection(key)
              .updateOne({ _id: item.id }, { $set: item }, { upsert: true })
          })(value),
        ),
        flatten,
      )

      await Promise.all(dbInserts(games))
    } catch (error) {
      logger.error(error)
    }
  },
}
export default messageHandler
