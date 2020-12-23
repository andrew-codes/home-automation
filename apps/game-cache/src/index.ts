import createDebugger from "debug"
import { MongoClient } from "mongodb"
import { connectAsync } from "async-mqtt"

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
} = process.env

const dbUri = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`
debug(dbUri)
const client = new MongoClient(dbUri)

const run = async () => {
  debug("Starting app.")
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
        await client.connect()
        debug("Adding playnite games")
        const db = await client.db("gameLibrary")
        const gamesPayload = JSON.parse(message.toString())
        debug("Number of games to import", gamesPayload.length)

        const gameUpdates = gamesPayload.map((game) => ({
          updateOne: {
            filter: {
              id: game.Id,
            },
            update: { $set: game },
            upsert: true,
          },
        }))
        const playNiteGames = await db.collection("playniteGames")
        await playNiteGames.bulkWrite(gameUpdates)

        const count = await playNiteGames.count()
        debug("Total games", count)
        await mqtt.publish("/playnite/game/list/updated", "")
      } catch (error) {
        debug(error)
      }
    }
  })
}

process.on("exit", async () => {
  await client.close()
})
run()
