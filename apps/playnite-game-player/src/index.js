const EventLogger = require("node-windows").EventLogger
const kill = require("node-windows").kill
const list = require("node-windows").list
const connectAsync = require("async-mqtt").connectAsync
const sh = require("shelljs")

const debug = new EventLogger("@ha/playnite-game-player-app/index")

const {
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  PLAYNITE_EXEC,
} = process.env

debug.info("Starting service.")

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
      debug.info(
        `Topic: ${topic}, message: ${JSON.stringify(
          JSON.parse(message.toString()),
          null,
          4
        )}`
      )
      if (topic === "/playnite/game/play") {
        const { id, platform } = JSON.parse(message.toString())
        if (platform !== "pc") {
          return
        }
        debug.info(`Playing PC game ${id}`)
        sh.exec(`${PLAYNITE_EXEC} --start ${id}`, (code, stdout, stderr) => {
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
    debug.error(error)
  }
}

run().then(() => debug.info("Run has been run."))
