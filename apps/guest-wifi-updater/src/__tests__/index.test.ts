jest.mock("@ha/mqtt-heartbeat")
jest.mock("redux-saga")
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"
import run from "../"

describe("guest wifi updater", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createMqttHeartbeat).toBeCalledWith("guest-wifi-updater-service")
  })
})
