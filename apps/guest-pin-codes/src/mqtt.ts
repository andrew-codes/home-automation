import { AsyncMqttClient, connectAsync } from "async-mqtt"

const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env

const createMqttClient = async (): Promise<AsyncMqttClient> => {
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })
  return mqtt
}

export default createMqttClient
