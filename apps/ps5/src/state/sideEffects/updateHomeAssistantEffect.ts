import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { AsyncMqttClient, QoS } from "async-mqtt"
import { call } from "redux-saga/effects"
import { PlayStation } from "../device.slice"

const logger = createLogger()

function* updateHomeAssistantEffect(ps: PlayStation) {
  logger.info(`Updating PlayStation (${ps.id}) state in HA`)
  logger.debug(
    `${ps.name} is available: ${ps.available} and in state ${ps.state.name}`,
  )

  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: QoS },
    ) => Promise<void>
  >(
    mqtt.publish.bind(mqtt),
    `playstation/${ps.id}/available`,
    ps.available ? "online" : "offline",
    { qos: 0 },
  )
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: QoS },
    ) => Promise<void>
  >(mqtt.publish.bind(mqtt), `playstation/${ps.id}/state`, ps.state.name, {
    qos: 0,
  })
}

export default updateHomeAssistantEffect
