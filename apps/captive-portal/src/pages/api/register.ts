import { connectAsync } from "async-mqtt"
import createDebug from "debug"
import { Controller } from "node-unifi"
import { NextApiRequest, NextApiResponse } from "next"

const debug = createDebug("@ha/captive-portal/api/register")

const macExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(400).end("Method Not Allowed")
    return
  }
  try {
    const payload = JSON.parse(req.body)

    if (!payload.mac || !macExp.test(payload.mac)) {
      res.status(400).end("Incorrect Parameters")
      return
    }

    const { UNIFI_IP, UNIFI_PORT, UNIFI_PASSWORD, UNIFI_USERNAME } = process.env
    const controller = new Controller({
      host: UNIFI_IP,
      port: UNIFI_PORT,
      sslverify: false,
    })
    await controller.login(UNIFI_USERNAME, UNIFI_PASSWORD)
    await controller.authorizeGuest(payload.mac, 4320)

    if (payload.isPrimaryDevice) {
      const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env
      const mqttPort = !MQTT_PORT ? "1883" : MQTT_PORT
      const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
        password: MQTT_PASSWORD,
        port: parseInt(mqttPort, 10),
        username: MQTT_USERNAME,
      })
      await mqtt.publish("home/guests/track-device", payload.mac)
    }
    res.status(200).send("")
  } catch (error) {
    debug(error)
    res.status(500).end("Server Error")
  }
}
