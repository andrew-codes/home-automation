import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"

const debug = createDebugger("@ha/mqtt-heartbeat/mqttHeartbeat")

const createMqttHeartbeat = async (
  requestTopic: string,
  responseTopic: string,
): Promise<void> => {
  const mqtt = await createMqtt()

  mqtt.subscribe(requestTopic)
  mqtt.on("message", (topic) => {
    debug("Received topic for heartbeat", topic)
    mqtt.publish(responseTopic, "")
  })
}

export default createMqttHeartbeat
