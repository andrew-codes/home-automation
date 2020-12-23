import createDebugger from "debug"
import { connectAsync } from "async-mqtt"
import wol from "wakeonlan"

const debug = createDebugger("@ha/game-cache-primer-app/index")

const {
  GAMING_ROOM_GAMING_PC_MAC,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
} = process.env

const run = async () => {
  debug("Starting app.")
  await wol(GAMING_ROOM_GAMING_PC_MAC)
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.publish("/playnite/game/list/request", "")
}

run().then(() => debug("Exiting app."))
