import createDebugger from "debug"
import fetch from "node-fetch"
import igdb from "igdb-api-node"
import { connectAsync } from "async-mqtt"
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
        const db = await mongo.db("gameLibrary")
        debug("Adding playnite games")
        const callApi = rateLimit(igdbClient)
        const gamesPayload = JSON.parse(message.toString()).map(formatKeys)
        debug("Number of playnite games to import", gamesPayload.length)
        const playNiteGameUpdates = gamesPayload.map((game) => ({
          updateOne: {
            filter: {
              id: game.id,
            },
            update: { $set: game },
            upsert: true,
          },
        }))
        const playNiteGamesCollection = db.collection("playniteGames")
        await playNiteGamesCollection.bulkWrite(playNiteGameUpdates)
        await playNiteGamesCollection.createIndex("id")
        const playniteGameCount = await playNiteGamesCollection.count()
        debug("Total number of Playnite games", playniteGameCount)

        const gameDetailsCollection = db.collection("gameDetails")
        gameDetailsCollection.createIndex("id")
        gameDetailsCollection.createIndex("playNightId")
        const notFoundGamesCollection = db.collection("notFoundGames")
        notFoundGamesCollection.createIndex("id")
        const gamesWithErrorsCollection = db.collection(
          "importedGamesWithErrors"
        )
        gamesWithErrorsCollection.createIndex("id")
        const updateAncillaryDetails = createAncillaryUpdater(db, callApi)

        for (let gameIndex = 0; gameIndex < gamesPayload.length; gameIndex++) {
          const playniteGame = gamesPayload[gameIndex]
          try {
            const gameExists =
              (await gameDetailsCollection
                .find({
                  playniteId: playniteGame.id,
                })
                .count()) > 1
            if (gameExists) {
              continue
            }
            const { data: gameResult } = await callApi((client) =>
              client
                .fields("*")
                .limit(1)
                .search(playniteGame.name.replace(/"/g, '\\"'))
                .request("/games")
            )
            if (!gameResult) {
              await notFoundGamesCollection.updateOne({
                filter: {
                  id: playniteGame.id,
                },
                update: { $set: playniteGame },
                upsert: true,
              })
              continue
            }
            gameResult.playniteId = playniteGame.id
            const game = formatKeys(gameResult)

            debug("Saving ancillary data")
            await updateAncillaryDetails(
              "artworks",
              "artworks",
              "artworks",
              game
            )
            await updateAncillaryDetails("cover", "covers", "covers", game)
            await updateAncillaryDetails(
              "collection",
              "collections",
              "collections",
              game
            )
            await updateAncillaryDetails(
              "franchise",
              "franchises",
              "franchises",
              game
            )
            await updateAncillaryDetails("genres", "genres", "genres", game)
            await updateAncillaryDetails(
              "gameModes",
              "game_modes",
              "gameMods",
              game
            )
            await updateAncillaryDetails(
              "multiplayerMods",
              "multiplayer_modes",
              "multiplayerModes",
              game
            )
            await updateAncillaryDetails(
              "keywords",
              "keywords",
              "keywords",
              game
            )
            await updateAncillaryDetails(
              "playerPerspectives",
              "player_perspectives",
              "playerPerspectives",
              game
            )

            const bucket = new GridFSBucket(db)
            const scrapeImages = createImageScraper(db, bucket)

            debug("Downloading covers")
            await scrapeImages("covers", game)
            debug("Downloading artworks")
            await scrapeImages("artworks", game)

            debug("Saving game from API")
            gameDetailsCollection.updateOne({
              filter: {
                id: game.id,
              },
              update: { $set: game },
              upsert: true,
            })
          } catch (error) {
            debug(error)
            await gamesWithErrorsCollection.updateOne({
              filter: {
                id: playniteGame.id,
              },
              update: { $set: playniteGame },
              upsert: true,
            })
          }
        }

        debug("Done! Publshing updated event")
        await mqtt.publish("/playnite/game/list/updated", "")
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

function rateLimit(api) {
  return async (cb) => {
    const results = await cb(api)
    await sleepRateLimit()
    return results
  }
}

function createAncillaryUpdater(db, callApi) {
  return async (field, urlSuffix, collectionName, game) => {
    const { data: items } = await callApi((client) =>
      client
        .fields("*")
        .where(`id = ${get(field)(game)}`)
        .request(`/${urlSuffix}`)
    )
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

function createImageScraper(db, bucket) {
  return async (collection, game) => {
    await db
      .collection(collection)
      .find({ id: game.cover }, { id: 1, imageId: 1 })
      .map(async ({ id, imageId }) => {
        debug("Found image", id, imageId)
        const resp = await fetch(`http://igdb.com/images/${imageId}`, {
          method: "GET",
        })
        return new Promise((resolve, reject) => {
          resp.body
            .pipe(bucket.openUploadStream(id))
            .on("error", function (error) {
              debug("error", error)
              reject(error)
            })
            .on("finish", function () {
              resolve(true)
            })
        })
      })
  }
}
