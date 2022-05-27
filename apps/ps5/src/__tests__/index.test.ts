jest.mock("@ha/mqtt-client")
jest.mock("@ha/mqtt-heartbeat")
import run from "../"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"

describe("ps5", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createMqttHeartbeat).toBeCalledWith("ps5-service")
  })
})
