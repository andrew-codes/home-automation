import createDebugger from "debug"
import fetch from "node-fetch"
import igdb from "igdb-api-node"
import { connectAsync } from "async-mqtt"
import { first, flatten, isEmpty, uniq } from "lodash"
import { get } from "lodash/fp"
import { MongoClient, GridFSBucket } from "mongodb"
import { formatKeys } from "@ha/string-utils"

const debug = createDebugger("@ha/game-cache-app/index")

const {
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_PASSWORD,
  MONGODB_USERNAME,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
} = process.env

const dbUri = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`
const mongo = new MongoClient(dbUri)

const run = async () => {
  debug("Starting app.")
  const twitchAuthRequest = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  )
  const twitchAuth = await twitchAuthRequest.json()
  const igdbClient = igdb(TWITCH_CLIENT_ID, twitchAuth.access_token)
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.subscribe("/playnite/game/list")

  mqtt.on("message", async (topic, message) => {
    debug("topic", topic)
    if (topic === "/playnite/game/list") {
      try {
        await mongo.connect()
        debug("Adding playnite games")
        const db = await mongo.db("gameLibrary")
        const updateFromIgdb = createUpdater(db, igdbClient)
        debug(message.toString()[19899])
        const gamesPayload = JSON.parse(message.toString()).map(formatKeys)
        debug("Number of games to import", gamesPayload.length)
        const playNiteGameUpdates = gamesPayload.map((game) => ({
          updateOne: {
            filter: {
              id: game.id,
            },
            update: { $set: game },
            upsert: true,
          },
        }))
        const playNiteGamesCollection = await db.collection("playniteGames")
        await playNiteGamesCollection.bulkWrite(playNiteGameUpdates)
        await playNiteGamesCollection.createIndex("id")
        const playniteGameCount = await playNiteGamesCollection.count()
        debug("Total number of Playnite games", playniteGameCount)

        const fetchedGames: any[] = []
        const gamesWithoutResults: any[] = []
        for (let gameIndex = 0; gameIndex < gamesPayload.length; gameIndex++) {
          const game = gamesPayload[gameIndex]
          debug(game.name)
          const { data: gameResults } = await igdbClient
            .fields("*")
            .limit(1)
            .search(game.name.replace(/"/g, '\\"'))
            .request("/games")
          await sleepRateLimit()
          let fetchedGame = first(gameResults)
          if (fetchedGame) {
            fetchedGame.playNightId = game.id
            fetchedGames.push(fetchedGame)
          } else {
            gamesWithoutResults.push(game)
          }
        }
        debug("Total number of fetched IGDB games", fetchedGames.length)
        debug("Total games not found in IGDB", gamesWithoutResults.length)
        const notFoundGamesCollection = await db.collection("notFoundGames")
        const notFoundGamesUpdates = gamesWithoutResults.map((game) => ({
          updateOne: {
            filter: {
              id: game.id,
            },
            update: { $set: game },
            upsert: true,
          },
        }))
        notFoundGamesCollection.bulkWrite(notFoundGamesUpdates)
        notFoundGamesCollection.createIndex("id")

        const igdbGamesCollection = await db.collection("gameDetails")

        const existingGames = await igdbGamesCollection
          .find(
            {
              id: { $in: fetchedGames.map(get("id")) },
            },
            { id: 1 }
          )
          .toArray()
        const newGames = fetchedGames.filter(
          (game) => !existingGames.map(get("id")).includes(game.id)
        )
        debug("New game count", newGames.length)
        if (isEmpty(newGames)) {
          return
        }

        const igdbGamesUpdate = newGames.map((game) => ({
          updateOne: {
            filter: {
              id: game.id,
            },
            update: { $set: formatKeys(game) },
            upsert: true,
          },
        }))
        await igdbGamesCollection.bulkWrite(igdbGamesUpdate)
        await igdbGamesCollection.createIndex("id")
        await igdbGamesCollection.createIndex("playNightId")
        await updateFromIgdb("artworks", "artworks", "artworks", newGames)
        await updateFromIgdb("cover", "covers", "covers", newGames)
        await updateFromIgdb(
          "collection",
          "collections",
          "collections",
          newGames
        )
        await updateFromIgdb("franchise", "franchises", "franchises", newGames)
        await updateFromIgdb("genres", "genres", "genres", newGames)
        await updateFromIgdb("gameModes", "game_modes", "gameMods", newGames)
        await updateFromIgdb(
          "multiplayerMods",
          "multiplayer_modes",
          "multiplayerModes",
          newGames
        )
        await updateFromIgdb("keywords", "keywords", "keywords", newGames)
        await updateFromIgdb(
          "playerPerspectives",
          "player_perspectives",
          "playerPerspectives",
          newGames
        )

        const bucket = new GridFSBucket(db)
        await db
          .collection("covers")
          .find({}, { id: 1, imageId: 1 })
          .forEach(async ({ id, imageId }) => {
            debug("cover id", id, imageId)
            const resp = await fetch(`http://igdb.com/images/${imageId}`, {
              method: "GET",
            })
            new Promise((resolve, reject) => {
              resp.body
                .pipe(bucket.openUploadStream(id))
                .on("error", function (error) {
                  debug("error", error)
                  reject(error)
                })
                .on("finish", function () {
                  sleepRateLimit().then(resolve)
                })
            })
          })

        await db
          .collection("artworks")
          .find({}, { id: 1, imageId: 1 })
          .forEach(async ({ id, imageId }) => {
            debug("artwork id", id, imageId)
            const resp = await fetch(`http://igdb.com/images/${imageId}`, {
              method: "GET",
            })
            new Promise((resolve, reject) => {
              resp.body
                .pipe(bucket.openUploadStream(id))
                .on("error", function (error) {
                  debug("error", error)
                  reject(error)
                })
                .on("finish", function () {
                  sleepRateLimit().then(resolve)
                })
            })
          })

        await mqtt.publish("/playnite/game/list/updated", "")
        debug("done")
      } catch (error) {
        debug(error)
      }
    }
  })
}

process.on("exit", async () => {
  await mongo.close()
})
run()

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}

async function sleepRateLimit() {
  await sleep(350)
}

function createUpdater(db, igdbClient) {
  return async (field, urlSuffix, collectionName, games) => {
    const ids = flatten(games.map(get(field))).filter(Boolean)
    if (isEmpty(ids)) {
      return
    }
    const { data: items } = await igdbClient
      .fields("*")
      .where(`id = (${ids.join(",")})`)
      .request(`/${urlSuffix}`)
    await sleepRateLimit()
    const collection = db.collection(`${collectionName}`)
    const itemsUpdate = items.map((item) => ({
      updateOne: {
        filter: {
          id: item.id,
        },
        update: { $set: formatKeys(item) },
        upsert: true,
      },
    }))
    await collection.createIndex("id")
    await collection.bulkWrite(itemsUpdate)
  }
}
