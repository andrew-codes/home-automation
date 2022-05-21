jest.mock("@ha/mqtt-client")
jest.mock("@ha/unifi-client")
import { createMqtt } from "@ha/mqtt-client"
import { createUnifi } from "@ha/unifi-client"
import { when } from "jest-when"
import run from "../app"

describe("app", () => {
  const subscribe = jest.fn()
  const onMock = jest.fn()
  const authorizeGuest = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(createMqtt).mockResolvedValue({
      on: onMock,
      subscribe,
    })
    jest.mocked(createUnifi).mockResolvedValue({
      authorizeGuest,
    })
  })

  test("run will subscribe to device renewal topics", async () => {
    await run()

    expect(subscribe).toHaveBeenCalledWith("home/guests/renew-devices")
  })

  test("messages with topics other than device renewal do not authorize devices", async () => {
    let messageHandler
    when(onMock)
      .calledWith("message", expect.any(Function))
      .mockImplementation((type, handler) => {
        messageHandler = handler
      })
    await run()

    await messageHandler("another/message", "{}")
    expect(authorizeGuest).not.toHaveBeenCalled()
  })

  test("messages with device renewal topic will authorize all registered guest devices provided in mqtt message", async () => {
    let messageHandler
    ;(onMock as jest.Mock).mockImplementation((type, handler) => {
      messageHandler = handler
    })

    await run()

    await messageHandler("home/guests/renew-devices", "address,address-2")
    expect(authorizeGuest).toHaveBeenCalledWith("address", 4320)
    expect(authorizeGuest).toHaveBeenCalledWith("address-2", 4320)
  })
})
