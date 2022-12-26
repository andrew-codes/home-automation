jest.mock("@ha/mqtt-client")
jest.mock("@ha/http-heartbeat")
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/http-heartbeat"
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

    expect(createHeartbeat).toBeCalled()
  })

  test("Subscribes to HA game media player registrations.", async () => {
    await run()
    expect(subscribe).toBeCalledWith("homeassistant/game_media_player/state")
  })
})
