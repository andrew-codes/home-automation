import * as sut from "../"
import createHeartbeat from "../mqttHeartbeat"

describe("mqtt-heartbeat package", () => {
  test("exports mqttHeartbeat function", () => {
    expect(sut.createHeartbeat).toEqual(createHeartbeat)
  })
})
