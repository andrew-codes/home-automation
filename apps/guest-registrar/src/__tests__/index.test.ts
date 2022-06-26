jest.mock("@ha/mqtt-heartbeat")
jest.mock("redux-saga")
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import run from "../"

describe("guest wifi updater", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalledWith("guest-registrar-service")
  })
})
