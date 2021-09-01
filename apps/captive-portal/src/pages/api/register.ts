import { connectAsync } from "async-mqtt"
import createDebug from "debug"
import createUnifi from "node-unifiapi"
import { NextApiRequest, NextApiResponse } from 'next'

const debug = createDebug("@ha/captive-portal/api/register")

const macExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(400).end("Method Not Allowed")
    return
  }
  try {
    const payload = JSON.parse(req.body)
    const { PASS_PHRASE } = process.env
    if (!PASS_PHRASE || payload.passPhrase !== PASS_PHRASE) {
      res.status(403).end("Not Authorized")
      return
    }

    if (!payload.mac || !macExp.test(payload.mac)) {
      res.status(400).end("Incorrect Parameters")
      return
    }

    const { UNIFI_IP, UNIFI_PORT, UNIFI_PASSWORD, UNIFI_USERNAME } = process.env
    const unifi = createUnifi({
      baseUrl: `https://${UNIFI_IP}:${UNIFI_PORT}`,
      password: UNIFI_PASSWORD,
      username: UNIFI_USERNAME,
    })
    unifi.authorize_guest(payload.mac, 4320)

    if (payload.isPrimaryDevice) {
      const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env
      const mqttPort = !MQTT_PORT ? "1883" : MQTT_PORT
      const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
        password: MQTT_PASSWORD,
        port: parseInt(mqttPort, 10),
        username: MQTT_USERNAME,
      })
      await mqtt.publish("/homeassistant/guest/track-device", payload.mac)
    }
    res.status(200).send("")
  } catch (error) {
    debug(error)
    res.status(500).end("Server Error")
  }
}
