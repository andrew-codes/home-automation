jest.mock("express")
import express, { Application } from "express"
import path from "path"
import { mocked } from "ts-jest/utils"
import { when } from "jest-when"
import configureRoutes from "../configureRoutes"
import { AsyncMqttClient } from "async-mqtt"

describe("configureRoutes", () => {
  const app = mocked({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  } as unknown) as Application
  const mqtt = mocked({
    publish: jest.fn(),
  } as unknown) as AsyncMqttClient
  const unifi = mocked({
    authorize_guest: jest.fn(),
  })
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("serves static files", () => {
    when(express.static)
      .calledWith(path.join(__dirname, "..", "static"))
      .mockReturnValue("./path/to/static")
    configureRoutes(app, mqtt, unifi)

    expect(app.use).toHaveBeenCalledWith("./path/to/static")
  })

  test("root route sends register page", async () => {
    const sendFile = jest.fn()
    let routeHandler
    when(app.get)
      .calledWith("/", expect.anything())
      .mockImplementation((route, handler) => {
        routeHandler = handler
      })
    configureRoutes(app, mqtt, unifi)
    await routeHandler({ query: { mac: "value" } }, { sendFile })
    expect(sendFile).toHaveBeenCalledWith(
      path.join(__dirname, "..", "static", "register.html")
    )
  })

  test("root route throws error when no MAC address is found in query string", async () => {
    let routeHandler
    when(app.get)
      .calledWith("/", expect.anything())
      .mockImplementation((route, handler) => {
        routeHandler = handler
      })
    const sendStatus = jest.fn()
    configureRoutes(app, mqtt, unifi)
    await routeHandler({ query: {} }, { sendStatus })
    expect(sendStatus).toHaveBeenCalledWith(500)
  })

  test("register route responds with a 500 if no MAC address is provided", async () => {
    let routeHandler
    when(app.post)
      .calledWith("/register", expect.anything())
      .mockImplementation((route, handler) => {
        routeHandler = handler
      })
    const sendStatus = jest.fn()
    configureRoutes(app, mqtt, unifi)
    await routeHandler({ body: {} }, { sendStatus })
    expect(sendStatus).toHaveBeenCalledWith(500)
  })

  test("register route will not publish message on MQTT for guest tracking when device is not primary", async () => {
    let routeHandler
    when(app.post)
      .calledWith("/register", expect.anything())
      .mockImplementation((route, handler) => {
        routeHandler = handler
      })
    const sendFile = jest.fn()
    configureRoutes(app, mqtt, unifi)
    await routeHandler(
      { body: { mac: "address", isPrimaryDevice: false } },
      { sendFile }
    )

    expect(mqtt.publish).not.toHaveBeenCalledWith(
      "/homeassistant/guest/track-device",
      "address"
    )
  })

  test("register route will publish message on MQTT for guest tracking when device is primary", async () => {
    let routeHandler
    when(app.post)
      .calledWith("/register", expect.anything())
      .mockImplementation((route, handler) => {
        routeHandler = handler
      })
    const sendFile = jest.fn()
    configureRoutes(app, mqtt, unifi)
    await routeHandler(
      { body: { mac: "address", isPrimaryDevice: true } },
      { sendFile }
    )

    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest/track-device",
      "address"
    )
  })

  test("register route authenticates device to Unifi for hot spot access regardless of device type", async () => {
    let routeHandler
    when(app.post)
      .calledWith("/register", expect.anything())
      .mockImplementation((route, handler) => {
        routeHandler = handler
      })
    const sendFile = jest.fn()
    configureRoutes(app, mqtt, unifi)
    await routeHandler(
      { body: { mac: "address", isPrimaryDevice: true } },
      { sendFile }
    )
    expect(unifi.authorize_guest).toHaveBeenCalledWith("address", 4320)
    await routeHandler(
      { body: { mac: "address-2", isPrimaryDevice: false } },
      { sendFile }
    )
    expect(unifi.authorize_guest).toHaveBeenCalledWith("address-2", 4320)
  })
})
