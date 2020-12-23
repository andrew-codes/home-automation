import createDebugger from "debug"
import { MongoClient } from "mongodb"
import { connectAsync } from "async-mqtt"
import fs from "fs/promises"
import path from "path"

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

const dbUri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`
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
        debug("set games")
        await client.connect()
        const db = await client.db("gameLibrary")
        const playNiteGames = db.collection("playniteGames")
        playNiteGames.insertMany(JSON.parse(message.toString()))

        await mqtt.publish("/playnite/game/list/updated", "")
        await fs.writeFile(
          path.join(__dirname, "games.json"),
          message.toString(),
          "utf8"
        )
      } finally {
        await client.close()
      }
      return
    }
  })
}

run()
