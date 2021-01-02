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
  debug.info("Connecting MQTT client")
  try {
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
        debug.info(`Playing PC game ${id}`)
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
          debug.info(`PID: ${pid}`)
          kill(pid, () => {
            debug.info("Playnite stopped")
          })
        }, true)
      }
    })
  } catch (error) {
    debug.info(error)
  }
}

run()
