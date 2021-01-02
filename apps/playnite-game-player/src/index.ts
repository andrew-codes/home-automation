import { EventLogger, kill, list } from "node-windows"
import { connectAsync } from "async-mqtt"
import { exec } from "shelljs"

var debug = new EventLogger("@ha/playnite-game-player-app/index")

const {
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  PLAYNITE_EXEC,
} = process.env

debug.info("Starting service.")
debug.warn("Watch out!")
debug.error("Something went wrong.")

async function run() {
  debug.debug("Connecting MQTT client")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.subscribe("/playnite/game/play/pc")
  await mqtt.subscribe("/playnite/game/stop/pc")

  mqtt.on("message", async (topic, message) => {
    if (topic === "/playnite/game/play") {
      const { id, platform } = JSON.parse(message.toString())
      if (platform !== "pc") {
        return
      }
      debug.debug(`Playing PC game ${id}`)
      exec(`${PLAYNITE_EXEC} --start ${id}`, (code, stdout, stderr) => {
        debug.info(`Exit code ${code}`)
      })
    }

    if (topic === "/playnite/game/stop/pc") {
      const { platform } = JSON.parse(message.toString())
      if (platform !== "pc") {
        return
      }

      list((services) => {
        const pid = services.find((svc) => svc.SessionName === "Playnite")
        debug.debug(`PID: ${pid}`)
        kill(pid, () => {
          debug.info("Playnite stopped")
        })
      }, true)
    }
  })
}

run()
