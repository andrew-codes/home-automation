jest.mock("@ha/mqtt-heartbeat")
import run from "../"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"

describe("ps5", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createMqttHeartbeat).toBeCalledWith(
      "home/ps5/hearbeat/request",
      "home/ps5/hearbeat/response",
    )
  })
})
