jest.mock("node-unifiapi")
jest.mock("async-mqtt")
import { merge } from "lodash"
import register from "../register"
import createUnifi from "node-unifiapi"
import { AsyncMqttClient, connectAsync } from "async-mqtt"
import { when } from "jest-when"
import { mocked } from "ts-jest/utils"

let req
let res
let unifi
let mqtt: AsyncMqttClient

beforeEach(async () => {
  process.env.MQTT_HOST = "mqtt-host"
  process.env.MQTT_PASSWORD = "mqtt-password"
  process.env.MQTT_PORT = "8123"
  process.env.MQTT_USERNAME = "mqtt-username"
  process.env.PASS_PHRASE = "pass phrase"
  process.env.UNIFI_IP = "ip"
  process.env.UNIFI_PASSWORD = "unifi-password"
  process.env.UNIFI_PORT = "port"
  process.env.UNIFI_USERNAME = "unifi-username"
  req = { method: "POST" }
  res = {
    status: jest.fn(),
  }
  unifi = mocked({
    authorize_guest: jest.fn(),
  })
  mqtt = mocked({
    publish: jest.fn(),
  } as unknown) as AsyncMqttClient
  createUnifi.mockReturnValue(unifi)
})

test("non-POST HTTP verbs are not allowed", async () => {
  await register(merge({}, req, { method: "GET" }), res)
  await register(merge({}, req, { method: "PUT" }), res)
  await register(merge({}, req, { method: "DELETE" }), res)
  expect(res.status).toBeCalledTimes(3)
  expect(res.status).toBeCalledWith(400)
})

test("mal-formed body responds with a 500", async () => {
  await register(req, res)
  expect(res.status).toBeCalledWith(500)
})

test("no pass phrase env var will return 403", async () => {
  delete process.env.PASS_PHRASE
  await register(merge({}, req, { body: JSON.stringify({}) }), res)
  expect(res.status).toBeCalledWith(403)
})

test("missing pass phrase address will respond with a 403", async () => {
  await register(merge({}, req, { body: JSON.stringify({}) }), res)
  expect(res.status).toBeCalledWith(403)
})

test("invalid pass phrase will respond with a 403", async () => {
  await register(
    merge({}, req, { body: JSON.stringify({ passPhrase: "not right" }) }),
    res
  )
  expect(res.status).toBeCalledWith(403)
})

test("missing MAC address will respond with a 400", async () => {
  await register(
    merge({}, req, { body: JSON.stringify({ passPhrase: "pass phrase" }) }),
    res
  )
  expect(res.status).toBeCalledWith(400)
})

test("mal-formed MAC address will respond with a 400", async () => {
  await register(
    merge({}, req, {
      body: JSON.stringify({ passPhrase: "pass phrase", mac: "123" }),
    }),
    res
  )
  expect(res.status).toBeCalledWith(400)
})

test("valid pass phrase and MAC address will authorize guest", async () => {
  when(createUnifi)
    .calledWith({
      baseUrl: "https://ip:port",
      password: "unifi-password",
      username: "unifi-username",
    })
    .mockReturnValue(unifi)
  await register(
    merge({}, req, {
      body: JSON.stringify({
        passPhrase: "pass phrase",
        mac: "3D:F2:C9:A6:B3:4F",
      }),
    }),
    res
  )
  expect(unifi.authorize_guest).toBeCalledWith("3D:F2:C9:A6:B3:4F", 4320)
  expect(res.status).toBeCalledWith(200)
})

test("primary devices will be tracked via published mqtt topic", async () => {
  when(connectAsync)
    .calledWith("tcp://mqtt-host", {
      password: "mqtt-password",
      port: 8123,
      username: "mqtt-username",
    })
    .mockResolvedValue(mqtt)
  await register(
    merge({}, req, {
      body: JSON.stringify({
        passPhrase: "pass phrase",
        mac: "3D:F2:C9:A6:B3:4F",
        isPrimaryDevice: true,
      }),
    }),
    res
  )
  expect(mqtt.publish).toBeCalledWith(
    "/homeassistant/guest/track-device",
    "3D:F2:C9:A6:B3:4F"
  )
})

test("default mqtt port is 1883", async () => {
  delete process.env.MQTT_PORT
  await register(
    merge({}, req, {
      body: JSON.stringify({
        passPhrase: "pass phrase",
        mac: "3D:F2:C9:A6:B3:4F",
        isPrimaryDevice: true,
      }),
    }),
    res
  )
  expect(connectAsync).toBeCalledWith("tcp://mqtt-host", {
    password: "mqtt-password",
    port: 1883,
    username: "mqtt-username",
  })
})
