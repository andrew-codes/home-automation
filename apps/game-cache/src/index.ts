import createDebugger from "debug"
import redis from "async-redis"
import { connectAsync } from "async-mqtt"

const debug = createDebugger("@ha/game-cache-app/index")

const {
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

  mqtt.on("message", async (topic, message) => {
    debug("topic", topic)
    let payload = null
    debug("payload", JSON.stringify(payload, null, 2))
    await redisClient.set("games", message.toString())
    await mqtt.publish("/playnite/game/list/updated", "")
  })
}

run()
