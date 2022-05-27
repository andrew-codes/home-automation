import * as sut from "../"
import createMqttHeartbeat from "../mqttHeartbeat"

describe("mqtt-heartbeat package", () => {
  test("exports mqttHeartbeat function", () => {
    expect(sut.createMqttHeartbeat).toEqual(createMqttHeartbeat)
  })
})
