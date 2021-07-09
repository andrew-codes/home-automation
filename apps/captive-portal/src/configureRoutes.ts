import express, { Application } from "express"
import { AsyncMqttClient } from "async-mqtt"
import path from "path"
const debug = require("debug")("@ha/captive-portal/createServer")

const staticDir = path.join(__dirname, "static")
const thankYouPage = path.join(staticDir, "thank-you.html")
const registerPage = path.join(staticDir, "register.html")

const configureRoutes = (
  app: Application,
  mqtt: AsyncMqttClient,
  unifi: {
    authorize_guest: (mac: string, authorizationTime: number) => Promise<null>
  }
): Application => {
  app.use(express.static(staticDir))
  app.get("/", async (req, res) => {
    try {
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

  // app.use(express.urlencoded({ extended: true }))
  app.post("/register", async (req, res) => {
    try {
      const { mac, isPrimaryDevice } = req.body
      if (!mac) {
        throw new Error("No MAC address found in request body")
      }
      debug("mac", mac)
      debug("isPrimaryDevice", isPrimaryDevice)
      await unifi.authorize_guest(mac, 4320)
      if (isPrimaryDevice) {
        await mqtt.publish("/homeassistant/guest/track-device", mac)
      }
      // await gql({
      //   query: `mutation track($mac: String, $isPrimary: Boolean) {
      //   trackGuestDevice(mac: $mac, isPrimary: $isPrimary) {
      //     id
      //   }
      // }`,
      //   variables: {
      //     mac,
      //     isPrimary: !!isPrimaryDevice,
      //   },
      // })
      res.sendFile(thankYouPage)
    } catch (e) {
      debug(e)
      console.log(e)
      res.sendStatus(500)
    }
  })

  return app
}

export default configureRoutes
