jest.mock("@ha/mqtt-client")
jest.mock("@ha/mqtt-heartbeat")
import run from "../"
import { createHeartbeat } from "@ha/mqtt-heartbeat"

describe("ps5", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalledWith("ps5")
  })
})
