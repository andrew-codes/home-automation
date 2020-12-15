const debug = require("debug")("@ha/captive-portal/server")
const express = require("express")
const path = require("path")
const unifi = require("node-unifiapi")
const { connectAsync } = require("async-mqtt")

const {
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  PORT,
  USG_IP,
  USG_PORT,
  USG_PASSWORD,
  USG_USERNAME,
} = process.env

const staticDir = path.join(__dirname, "static")
const thankYouPage = path.join(staticDir, "thank-you.html")
const registerPage = path.join(staticDir, "register.html")

const app = express()

// A weekend (3 days) worth of time per authorization.
const getAuthorizationTime = () => 4320

app.use(express.static(path.join(__dirname, "static")))
app.get("/", async (req, res) => {
  try {
    console.log("we did it!", req.query)
    const mac = req.query.mac
    if (!mac) {
      throw new Error("No MAC address found in URL")
    }
    res.sendFile(registerPage)
  } catch (e) {
    debug(e)
    res.sendStatus(500)
  }
})

app.use(express.urlencoded({ extended: true }))
app.post("/register", async (req, res) => {
  try {
    const { mac, isPrimaryDevice } = req.body
    if (!mac) {
      throw new Error("No MAC address found in request body")
    }
    debug("mac", mac)
    debug("isPrimaryDevice", isPrimaryDevice)
    const unifiClient = unifi({
      baseUrl: `https://${USG_IP}:${USG_PORT}`,
      username: USG_USERNAME,
      password: USG_PASSWORD,
    })
    await unifiClient.authorize_guest(mac, getAuthorizationTime())

    if (isPrimaryDevice) {
      const mqttClient = await connectAsync(`tcp://${MQTT_HOST}:${MQTT_PORT}`, {
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
      })
      await mqttClient.publish("/homeassistant/guest/track-device", mac)
    }

    res.sendFile(thankYouPage)
  } catch (e) {
    debug(e)
    res.sendStatus(500)
  }
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
