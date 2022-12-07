jest.mock("@ha/mqtt-client")
jest.mock("@ha/http-heartbeat")
import run from "../"
import { createHeartbeat } from "@ha/http-heartbeat"

describe("ps5", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalled()
  })
})
