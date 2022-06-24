jest.mock("@ha/mqtt-client")
jest.mock("@ha/http-heartbeat")
import run from "../"
import { createHeartbeat } from "@ha/http-heartbeat"
import { healthUrlPath } from "../../scripts/config"

describe("ps5", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalledWith(healthUrlPath)
  })
})
