import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { PayloadAction } from "@reduxjs/toolkit"
import { AsyncMqttClient, QoS } from "async-mqtt"
import { call } from "redux-saga/effects"
import { DiscoveredPlayStation } from "../device.slice"

const logger = createLogger()

function* registerWithHomeAssistantEffect(
  action: PayloadAction<DiscoveredPlayStation>,
) {
  try {
    logger.info(`Registering PlayStation (${action.payload.id}) with HA`)
    const entityId = action.payload.name
      .replace(/[^a-zA-Z\d\s-_:]/g, "")
      .replace(/[\s-]/g, "_")
      .toLowerCase()

    logger.debug("Publishing power switch config")
    const mqtt: AsyncMqttClient = yield call(createMqtt)
    yield call<
      (
        topic: string,
        message: string | Buffer,
        { qos }: { qos: QoS },
      ) => Promise<void>
    >(
      mqtt.publish.bind(mqtt),
      `homeassistant/switch/${action.payload.id}/power/config`,
      JSON.stringify({
        availability: [
          {
            topic: `playstation/${action.payload.id}/available`,
            payload_available: "online",
            payload_not_available: "offline",
          },
        ],
        name: `${action.payload.name} Switch Power`,
        command_topic: `playstation/${action.payload.id}/set/power`,
        state_topic: `playstation/${action.payload.id}/state`,
        optimistic: false,
        icon: "mdi:sony-playstation",
        payload_available: "online",
        payload_not_available: "offline",
        state_on: "AWAKE",
        state_off: "STANDBY",
        payload_on: "AWAKE",
        payload_off: "STANDBY",
        unique_id: `switch_power`,
        device: {
          manufacturer: "Sony",
          model: `Playstation ${action.payload.type === "PS5" ? "5" : "4"} `,
          name: action.payload.name,
          identifiers: [action.payload.id],
          sw_version: action.payload.systemVersion,
        },
      }),
      { qos: 0 },
    )
  } catch (error) {
    logger.debug("Error registering PlayStation with HA")
    logger.error(error)
  }
}

export default registerWithHomeAssistantEffect
