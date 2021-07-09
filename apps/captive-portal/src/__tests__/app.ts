jest.mock("express")
jest.mock("async-mqtt")
jest.mock("node-unifiapi")
jest.mock("../configureRoutes")
import createUnifi from "node-unifiapi"
import { connectAsync } from "async-mqtt"
import { when } from "jest-when"
import run from "../app"
import express from "express"
import configureRoutes from "../configureRoutes"

describe("app", () => {
  let port = "801"

  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    process.env.PORT = port
    process.env.MQTT_HOST = "host"
    process.env.MQTT_PASSWORD = "password"
    process.env.MQTT_PORT = "1884"
    process.env.MQTT_USERNAME = "username"
    process.env.UNIFI_IP = "unifi"
    process.env.UNIFI_PORT = "863"
    process.env.UNIFI_USERNAME = "unifi-username"
    process.env.UNIFI_PASSWORD = "unifi-password"
  })

  test("express app listens on PORT provided as env var", async () => {
    const app = { listen: jest.fn() }
    ;(express as unknown as jest.Mock).mockReturnValue(app)
    await run()
    expect(app.listen).toBeCalledWith(port, expect.any(Function))
  })

  test("creates Routes with express app and configured mqtt, unifi clients", async () => {
    const app = { listen: jest.fn() }
    const mqtt = jest.fn()
    const unifi = jest.fn()
    ;(express as unknown as jest.Mock).mockReturnValue(app)
    when(connectAsync as unknown as jest.Mock)
      .calledWith(`tcp://host`, {
        password: "password",
        port: 1884,
        username: "username",
      })
      .mockResolvedValue(mqtt)
    when(createUnifi)
      .calledWith({
        baseUrl: "https://unifi:863",
        username: "unifi-username",
        password: "unifi-password",
      })
      .mockReturnValue(unifi)
    await run()
    expect(configureRoutes).toHaveBeenCalledWith(app, mqtt, unifi)
  })

  test("defaults to port 1883 for mqtt", async () => {
    delete process.env.MQTT_PORT
    const app = { listen: jest.fn() }
    const mqtt = jest.fn()
    const unifi = jest.fn()
    ;(express as unknown as jest.Mock).mockReturnValue(app)
    when(connectAsync as unknown as jest.Mock)
      .calledWith(`tcp://host`, {
        password: "password",
        port: 1883,
        username: "username",
      })
      .mockResolvedValue(mqtt)
    when(createUnifi)
      .calledWith({
        baseUrl: "https://unifi:863",
        username: "unifi-username",
        password: "unifi-password",
      })
      .mockReturnValue(unifi)
    await run()
    expect(configureRoutes).toHaveBeenCalledWith(app, mqtt, unifi)
  })
})
