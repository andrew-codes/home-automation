jest.mock("node-unifiapi")
jest.mock("async-mqtt")
import { testApiHandler } from "next-test-api-route-handler"
import { merge } from "lodash"
import register from "../register"
import createUnifi from "node-unifiapi"
import { connectAsync } from "async-mqtt"
import { when } from "jest-when"

const unifi = {
  authorize_guest: jest.fn(),
}
const mqtt = {
  publish: jest.fn(),
}

beforeEach(async () => {
  jest.resetAllMocks()
  createUnifi.mockReturnValue(unifi)
  process.env.MQTT_HOST = "mqtt-host"
  process.env.MQTT_PASSWORD = "mqtt-password"
  process.env.MQTT_PORT = "8123"
  process.env.MQTT_USERNAME = "mqtt-username"
  process.env.PASS_PHRASE = "pass phrase"
  process.env.UNIFI_IP = "ip"
  process.env.UNIFI_PASSWORD = "unifi-password"
  process.env.UNIFI_PORT = "port"
  process.env.UNIFI_USERNAME = "unifi-username"
})

test("non-POST HTTP verbs are not allowed", async () => {
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const getRes = await fetch({ method: "GET" })
      expect(getRes.status).toEqual(400)
      const putRes = await fetch({ method: "PUT" })
      expect(putRes.status).toEqual(400)
      const deleteRes = await fetch({ method: "DELETE" })
      expect(deleteRes.status).toEqual(400)
    },
  })
})

test("mal-formed body responds with a 500", async () => {
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const resp = await fetch({ method: "POST" })
      expect(resp.status).toEqual(500)
    },
  })
})

test("missing MAC address will respond with a 400", async () => {
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const resp = await fetch({
        method: "POST",
        body: JSON.stringify({ passPhrase: "pass phrase" }),
      })
      expect(resp.status).toEqual(400)
    },
  })
})

test("mal-formed MAC address will respond with a 400", async () => {
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const resp = await fetch({
        method: "POST",
        body: JSON.stringify({ passPhrase: "pass phrase", mac: "123" }),
      })
      expect(resp.status).toEqual(400)
    },
  })
})

test("valid MAC address will authorize guest", async () => {
  when(createUnifi)
    .calledWith({
      baseUrl: "https://ip:port",
      password: "unifi-password",
      username: "unifi-username",
    })
    .mockReturnValue(unifi)
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const resp = await fetch({
        method: "POST",
        body: JSON.stringify({
          passPhrase: "pass phrase",
          mac: "3D:F2:C9:A6:B3:4F",
        }),
      })
      expect(resp.status).toEqual(200)
      expect(unifi.authorize_guest).toBeCalledWith("3D:F2:C9:A6:B3:4F", 4320)
    },
  })
})

test("primary devices will be tracked via published mqtt topic", async () => {
  when(connectAsync)
    .calledWith("tcp://mqtt-host", {
      password: "mqtt-password",
      port: 8123,
      username: "mqtt-username",
    })
    .mockResolvedValue(mqtt)
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const resp = await fetch({
        method: "POST",
        body: JSON.stringify({
          passPhrase: "pass phrase",
          mac: "3D:F2:C9:A6:B3:4F",
          isPrimaryDevice: true,
        }),
      })
      expect(mqtt.publish).toBeCalledWith(
        "/homeassistant/guest/track-device",
        "3D:F2:C9:A6:B3:4F"
      )
    },
  })
})

test("default mqtt port is 1883", async () => {
  delete process.env.MQTT_PORT
  when(connectAsync)
    .calledWith("tcp://mqtt-host", {
      password: "mqtt-password",
      port: 1883,
      username: "mqtt-username",
    })
    .mockResolvedValue(mqtt)
  await testApiHandler({
    handler: register,
    url: "/api/register",
    test: async ({ fetch }) => {
      const resp = await fetch({
        method: "POST",
        body: JSON.stringify({
          passPhrase: "pass phrase",
          mac: "3D:F2:C9:A6:B3:4F",
          isPrimaryDevice: true,
        }),
      })
      expect(mqtt.publish).toBeCalledWith(
        "/homeassistant/guest/track-device",
        "3D:F2:C9:A6:B3:4F"
      )
    },
  })
})
