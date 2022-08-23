jest.mock("@ha/mqtt-client")
jest.mock("@ha/mqtt-heartbeat")
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import { when } from "jest-when"
import run from "../"

describe("game library updater", () => {
  const subscribe = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
    jest
      .mocked<() => Promise<{ subscribe; on }>>(createMqtt)
      .mockResolvedValue({ subscribe, on })

  })

  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalledWith(
      "game-library-updater",
    )
  })

  test("Subscribes to playnite library updates.", async () => {
    await run()
    expect(subscribe).toBeCalledWith("playnite/library/#")
  })
})
