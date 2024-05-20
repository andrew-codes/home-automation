jest.mock("@ha/http-heartbeat")
jest.mock("redux-saga")
import { createHeartbeat } from "@ha/http-heartbeat"
import run from "../"

describe("guest wifi updater", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalled()
  })
})
