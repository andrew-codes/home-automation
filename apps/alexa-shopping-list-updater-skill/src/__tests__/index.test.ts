jest.mock("@ha/mqtt-heartbeat")
import run from "../"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"

describe("alexa shopping list updater skill", () => {
  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createMqttHeartbeat).toBeCalledWith(
      "home/alexa-shopping-list-updater/hearbeat/request",
      "home/alexa-shopping-list-updater/hearbeat/response",
    )
  })
})
