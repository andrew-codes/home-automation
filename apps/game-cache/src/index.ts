import createDebugger from "debug"
import fetch from "node-fetch"
import igdb from "igdb-api-node"
import { connectAsync } from "async-mqtt"
import { first, flatten } from "lodash"
import { get } from "lodash/fp"
import { MongoClient } from "mongodb"
import { formatKeys } from "@ha/string-utils"
import path from "path"
import fs from "fs/promises"

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
          if (!fetchedGame) {
            fetchedGame = {
              fetchError: "Not Found",
            }
          }
          fetchedGame.playNightId = game.id
          fetchedGames.push(fetchedGame)
        }
        debug("Total number of fetched IGDB games", fetchedGames.length)
        const igdbGamesCollection = await db.collection("igdmGames")
        const existingGames = igdbGamesCollection
          .find({
            id: { $in: fetchedGames.map(get("id")) },
          })
          .toArray()
        const newGames = fetchedGames.filter((game) =>
          existingGames.map(get("id")).includes(game.id)
        )
        debug("New game count", newGames.length)

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
        await updateFromIgdb("cover", "covers", newGames)
        await updateFromIgdb("collection", "collections", newGames)
        await updateFromIgdb("franchise", "franchises", newGames)
        await updateFromIgdb("genres", "genres", newGames)
        await updateFromIgdb("tags", "tags", newGames)
        await updateFromIgdb("game_modes", "game_modes", newGames)
        await updateFromIgdb("multiplayer_modes", "multiplayer_modes", newGames)
        await updateFromIgdb("keywords", "keywords", newGames)

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

function createUpdater(db, igdbClient) {
  return async (field, typeName, games) => {
    const ids = flatten(games.map(get(field)))
    const { data: items } = await igdbClient
      .fields("*")
      .where(`id = (${ids.join(",")})`)
      .request(`/${typeName}`)
    await sleepRateLimit()
    const collection = await db.collection(`${typeName}`)
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
