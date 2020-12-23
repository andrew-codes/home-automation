import createDebugger from "debug"
import redis from "async-redis"
import { connectAsync } from "async-mqtt"
import wol from "wakeonlan"

const debug = createDebugger("@ha/game-cache-app/index")

const {
  GAMING_ROOM_GAMING_PC_MAC,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  REDIS_HOST,
  REDIS_PASSWORD,
} = process.env

const redisClient = redis.createClient({
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
})
redisClient.on("error", function (err) {
  debug("redis error", err)
})

const run = async () => {
  debug("Starting app.")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.subscribe("/playnite/game/list")
  await mqtt.subscribe("/playnite/game/update")

  mqtt.on("message", async (topic, message) => {
    debug("topic", topic)
    if (topic === "/playnite/game/list") {
      await redisClient.set("games", message.toString())
      await mqtt.publish("/playnite/game/list/updated", "")
      return
    }

    if (topic === "/playnite/game/update") {
      await wol(GAMING_ROOM_GAMING_PC_MAC)
      await mqtt.publish("/playnite/game/list/request", "")
    }
  })
}

run()
