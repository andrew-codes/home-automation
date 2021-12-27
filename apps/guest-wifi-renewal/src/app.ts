import createDebug from "debug"
import { connectAsync } from "async-mqtt"
import {
  createConnection,
  createLongLivedTokenAuth,
  getStates,
  HaWebSocket,
} from "home-assistant-js-websocket"
import { Controller } from "node-unifi"
import WebSocket from "ws"
const debug = createDebug("@ha/guest-wifi-renewal/apo")

const run = async (): Promise<void> => {
  const {
    HA_TOKEN,
    HA_URL,
    MQTT_HOST,
    MQTT_PASSWORD,
    MQTT_PORT,
    MQTT_USERNAME,
    UNIFI_IP,
    UNIFI_PASSWORD,
    UNIFI_PORT,
    UNIFI_USERNAME,
  } = process.env
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT ?? "1883", 10),
    username: MQTT_USERNAME,
  })
  mqtt.subscribe("/homeassistant/guest/renew-devices")

  const unifi = new Controller({
    host: UNIFI_IP,
    port: UNIFI_PORT,
    sslverify: false,
  })
  await unifi.login(UNIFI_USERNAME, UNIFI_PASSWORD)
  const auth = await createLongLivedTokenAuth(HA_URL ?? "", HA_TOKEN ?? "")
  const connection = await createConnection({
    auth,
    createSocket: async () => {
      const ws = new WebSocket(`wss://${HA_URL}/api/websocket`)
      const handleOpen = async (): Promise<void> => {
        try {
          ws.send(
            JSON.stringify({
              type: "auth",
              access_token: auth.accessToken,
            })
          )
        } catch (err) {
          ws.close()
        }
      }
      ws.on("open", handleOpen)
      return ws as unknown as HaWebSocket
    },
  })

  mqtt.on("message", async (topic) => {
    try {
      if (topic !== "/homeassistant/guest/renew-devices") return
      const states = await getStates(connection)
      const guestGroup = states.find(
        ({ entity_id }) => entity_id === "group.guests"
      )
      const guestDeviceIds = guestGroup?.attributes?.entity_id ?? []
      const guestDevices = states.filter((entity) =>
        guestDeviceIds.includes(entity.entity_id)
      )
      for (const guestDevice of guestDevices) {
        debug(guestDevice)
        await unifi.authorizeGuest(guestDevice.attributes.mac, 4320)
      }
    } catch (error) {
      debug(error)
    }
  })
}

export default run
