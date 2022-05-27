jest.mock("@ha/mqtt-client")
import createMqttHeartbeat from "../mqttHeartbeat"
import { AsyncMqttClient, createMqtt } from "@ha/mqtt-client"

describe("mqttHeartbeat", () => {
  const on = jest.fn()
  const publish = jest.fn()
  const subscribe = jest.fn()
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(createMqtt).mockResolvedValue({
      on,
      publish,
      subscribe,
    } as unknown as AsyncMqttClient)
  })

  test("creating a mqtt heartbeat will subscribe to the hearbeat topic and respond with the mqtt response topic", async () => {
    on.mockImplementation((message: string, cb) => {
      cb("home/service/heartbeat/response")
    })

    await createMqttHeartbeat(
      "home/service/heartbeat/request",
      "home/service/heartbeat/response",
    )

    expect(subscribe).toHaveBeenCalledWith("home/service/heartbeat/request")
    expect(publish).toHaveBeenCalledWith("home/service/heartbeat/response", "")
  })
})
