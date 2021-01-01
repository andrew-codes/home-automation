import createDebugger from "debug"
import fetch from "node-fetch"
import igdb from "igdb-api-node"
import path from "path"
import { connectAsync } from "async-mqtt"
import { first, isEmpty } from "lodash"
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
        const platformCollection = db.collection("platforms")
        const updateAncillaryDetails = createAncillaryUpdater(db, callApi)
        let game
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
            const { data: gameResults } = await callApi((client) =>
              client
                .fields("*")
                .limit(1)
                .search(playniteGame.name.replace(/"/g, '\\"'))
                .request("/games")
            )
            const gameResult = first(gameResults)
            if (!gameResult) {
              await notFoundGamesCollection.updateOne(
                {
                  id: playniteGame.id,
                },
                { $set: playniteGame },
                {
                  upsert: true,
                }
              )
              continue
            }
            gameResult.playniteId = playniteGame.id
            const formattedGameResult = formatKeys(gameResult)
            const game = {
              ...playniteGame,
              ...formattedGameResult,
              playniteId: playniteGame.id,
            }

            debug("Saving platform")
            platformCollection.updateOne(
              {
                id: game.platform.id,
              },
              { $set: game.platform },
              {
                upsert: true,
              }
            )

            debug("Saving artworks")
            await updateAncillaryDetails(
              "artworks",
              "artworks",
              "artworks",
              game
            )

            debug("Saving covers")
            await updateAncillaryDetails("cover", "covers", "covers", game)
            await updateAncillaryDetails(
              "collection",
              "collections",
              "collections",
              game
            )
            debug("Saving franchises")
            await updateAncillaryDetails(
              "franchise",
              "franchises",
              "franchises",
              game
            )
            await updateAncillaryDetails(
              "franchises",
              "franchises",
              "franchises",
              game
            )
            debug("Saving genres")
            await updateAncillaryDetails("genres", "genres", "genres", game)
            debug("Saving game modes")
            await updateAncillaryDetails(
              "gameModes",
              "game_modes",
              "gameModes",
              game
            )
            debug("Saving multipler mdoes")
            await updateAncillaryDetails(
              "multiplayerModes",
              "multiplayer_modes",
              "multiplayerModes",
              game
            )
            debug("Saving keywords")
            await updateAncillaryDetails(
              "keywords",
              "keywords",
              "keywords",
              game
            )
            debug("Saving player perspectives")
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

            debug("Saving game from API", game.name)
            gameDetailsCollection.updateOne(
              {
                id: game.id,
              },
              { $set: game },
              {
                upsert: true,
              }
            )
          } catch (error) {
            debug(error, playniteGame.name)
            await gamesWithErrorsCollection.updateOne(
              {
                id: playniteGame.id,
              },
              { $set: { playniteGame, game } },
              {
                upsert: true,
              }
            )
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
    let ids = game[field]
    if (!ids) {
      return
    }
    if (!Array.isArray(ids)) {
      ids = [ids]
    }
    if (isEmpty(ids)) {
      return
    }
    const { data: items } = await callApi((client) =>
      client
        .fields("*")
        .where(`id = (${ids.join(",")})`)
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
    const images = await db
      .collection(collection)
      .find({ game: game.id })
      .toArray()
    return Promise.all(
      images.map(async ({ id, imageId, url }) => {
        debug("Found image", id, imageId, url)
        const ext = path.extname(url)
        debug(ext)
        const resp = await fetch(
          `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}${ext}`,
          {
            method: "GET",
          }
        )
        return new Promise((resolve, reject) => {
          resp.body
            .pipe(bucket.openUploadStream(id.toString()))
            .on("error", function (error) {
              debug("error", error)
              reject(error)
            })
            .on("finish", function () {
              resolve(true)
            })
        })
      })
    )
  }
}
