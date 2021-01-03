const debug = require("debug")("@ha/playnite-game-player-app/index")
const connectAsync = require("async-mqtt").connectAsync
const path = require("path")
const sh = require("shelljs")
const {
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
} = require("./secrets")

debug("Starting service.")
debug(MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME)

async function run() {
  debug("Connecting MQTT client")
  try {
    const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
      password: MQTT_PASSWORD,
      port: parseInt(MQTT_PORT || "1883", 10),
      username: MQTT_USERNAME,
    })

    await mqtt.subscribe("/playnite/game/play")
    await mqtt.subscribe("/playnite/game/stopped")

    mqtt.on("message", async (topic, message) => {
      debug(topic)
      try {
        if (topic === "/playnite/game/play") {
          const { id, platform } = JSON.parse(message.toString())
          debug(id, platform)
          if (platform !== "pc") {
            return
          }
          const playniteExec = path.join(
            __dirname,
            "..",
            "..",
            "Playnite",
            "Playnite.FullscreenApp.exe"
          )
          debug(`Playing PC game ${id}`)
          debug(`${playniteExec} --start "${id}" --nolibupdate`)
          sh.exec(
            `${playniteExec} --start "${id}" --nolibupdate`,
            (code, stdout, stderr) => {
              debug(`Exit code ${code}`)
              debug(stdout)
              debug(stderr)
            }
          )
          return
        }

        if (topic === "/playnite/game/stopped") {
          const pid = sh.exec(
            `powershell.exe -Command { Get-Process -Name PlayniteFullscreenApp | select -expand id }`
          ).stdout
          sh.exec(`powershell.exe -Command { Stop-Process -Id ${pid} }`, {
            async: true,
          })
          return
        }
      } catch (err) {
        debug(err)
      }
    })
  } catch (error) {
    debug(error)
  }
}

run().then(() => debug("Run has been run."))
