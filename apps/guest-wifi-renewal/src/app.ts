import { connectAsync } from "async-mqtt"
import {
  createConnection,
  createLongLivedTokenAuth,
  getStates,
  HaWebSocket,
} from "home-assistant-js-websocket"
import createUnifi from "node-unifiapi"
import WebSocket from "ws"

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

  const unifi = createUnifi({
    baseUrl: `https://${UNIFI_IP}:${UNIFI_PORT}`,
    username: UNIFI_USERNAME,
    password: UNIFI_PASSWORD,
  })
  const auth = await createLongLivedTokenAuth(HA_URL ?? "", HA_TOKEN ?? "")
  const connection = await createConnection({
    auth,
    createSocket: async () => {
      return new WebSocket(`wss://${HA_URL}`) as unknown as HaWebSocket
    },
  })

  mqtt.on("message", async (topic) => {
    if (topic !== "/homeassistant/guest/renew-devices") return
    const states = await getStates(connection)
    const guestGroup = states.find(
      ({ entity_id }) => entity_id === "group.guests"
    )
    const guestDeviceIds = guestGroup?.attributes?.entity_id ?? []
    const guestDevices = states.filter((entity) =>
      guestDeviceIds.includes(entity.entity_id)
    )
    for (const device of guestDevices) {
      await unifi.authorize_guest(device.attributes.mac, 4320)
    }
  })
}

export default run