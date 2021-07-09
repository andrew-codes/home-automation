jest.mock("async-mqtt")
jest.mock("node-unifiapi")
jest.mock("home-assistant-js-websocket")
jest.mock("ws")
import { connectAsync } from "async-mqtt"
import { when } from "jest-when"
import createUnifi from "node-unifiapi"
import {
  createLongLivedTokenAuth,
  createConnection,
  getStates,
} from "home-assistant-js-websocket"
import WebSocket from "ws"
import run from "../app"

describe("app", () => {
  const mqttHost = "mqtt-host"
  const mqttUsername = "mqtt-username"
  const mqttPassword = "mqtt-password"
  const unifiUsername = "unifi"
  const unifiPassword = "unifi-password"
  const hassUrl = "ha"
  const authCode = "ha token"
  const mqttPort = 1884
  const subscribe = jest.fn()
  const onMock = jest.fn()
  const authorize_guest = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    process.env.MQTT_HOST = mqttHost
    process.env.MQTT_USERNAME = mqttUsername
    process.env.MQTT_PASSWORD = mqttPassword
    process.env.MQTT_PORT = mqttPort.toString()
  })

  test("run will subscribe to device renewal topics", async () => {
    when(connectAsync)
      .calledWith(`tcp://${mqttHost}`, {
        password: mqttPassword,
        port: mqttPort,
        username: mqttUsername,
      })
      .mockResolvedValue({
        on: onMock,
        subscribe,
      })
    await run()

    expect(subscribe).toHaveBeenCalledWith("/homeassistant/guest/renew-devices")
  })

  test("connects to unifi", async () => {
    process.env.UNIFI_IP = "123"
    process.env.UNIFI_PORT = "456"
    process.env.UNIFI_USERNAME = unifiUsername
    process.env.UNIFI_PASSWORD = unifiPassword
    ;(connectAsync as jest.Mock).mockResolvedValue({
      on: onMock,
      subscribe,
    })

    await run()
    expect(createUnifi).toBeCalledWith({
      baseUrl: "https://123:456",
      username: unifiUsername,
      password: unifiPassword,
    })
  })

  test("connects to home assistant", async () => {
    process.env.HA_URL = hassUrl
    process.env.HA_TOKEN = authCode
    const auth = { auth: true }
    ;(connectAsync as jest.Mock).mockResolvedValue({
      on: onMock,
      subscribe,
    })
    ;(createUnifi as jest.Mock).mockReturnValue({ authorize_guest })
    when(createLongLivedTokenAuth)
      .calledWith(hassUrl, authCode)
      .mockResolvedValue(auth)

    await run()
    expect(createConnection).toHaveBeenCalledWith({
      auth,
      createSocket: expect.any(Function),
    })
    const ws = (createConnection as jest.Mock).mock.calls[0][0].createSocket()
    expect(WebSocket).toHaveBeenCalledWith(`ws://${hassUrl}`)
  })

  test("messages with topics other than device renewal do not authorize devices", async () => {
    ;(connectAsync as jest.Mock).mockResolvedValue({
      on: onMock,
      subscribe,
    })
    let messageHandler
    when(onMock)
      .calledWith("message", expect.any(Function))
      .mockImplementation((type, handler) => {
        messageHandler = handler
      })
    await run()

    await messageHandler("another/message", "{}")
    expect(authorize_guest).not.toHaveBeenCalled()
  })

  test("messages with device renewal topic will authorize all registered guest devices from Home Assistant", async () => {
    ;(connectAsync as jest.Mock).mockResolvedValue({
      on: onMock,
      subscribe,
    })
    const connection = { connection: true }
    let messageHandler
    ;(onMock as jest.Mock).mockImplementation((type, handler) => {
      messageHandler = handler
    })
    ;(createUnifi as jest.Mock).mockReturnValue({ authorize_guest })
    ;(createConnection as jest.Mock).mockResolvedValue(connection)
    when(getStates as jest.Mock)
      .calledWith(connection)
      .mockResolvedValue([
        {
          entity_id: "group.guests",
          attributes: { entity_id: ["device_tracker.guest_1"] },
        },
        {
          entity_id: "device_tracker.guest_1",
          attributes: {
            mac: "address",
          },
        },
        {
          entity_id: "light.light_1",
          attributes: {
            mac: "address",
          },
        },
        {
          entity_id: "device_tracker.family_1",
          attributes: {
            mac: "address-2",
          },
        },
      ])

    await run()

    await messageHandler("/homeassistant/guest/renew-devices", "{}")
    expect(authorize_guest).toHaveBeenCalledWith("address", 4320)
    expect(authorize_guest).not.toHaveBeenCalledWith("address-2", 4320)
  })
})
