jest.mock("@ha/mqtt-client")
jest.mock("@ha/http-heartbeat")
jest.mock("googleapis")
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/http-heartbeat"
import { GoogleAuth } from "google-auth-library"
import { google } from "googleapis"
import { when } from "jest-when"
import run from "../"

describe("external services dns updater", () => {
  const subscribe = jest.fn()
  const on = jest.fn()
  let auth

  beforeEach(() => {
    jest.resetAllMocks()
    jest
      .mocked<() => Promise<{ subscribe; on }>>(createMqtt)
      .mockResolvedValue({ subscribe, on })

    auth = jest.mocked(GoogleAuth)
    jest.mocked(google, true)
    jest.mocked(google.auth.GoogleAuth).mockImplementation(() => auth)
  })

  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalled()
  })

  test("Subscribes to external_ip sensor set state MQTT topics.", async () => {
    await run()
    expect(subscribe).toBeCalledWith("homeassistant/sensor/external_ip/set")
  })

  test("google API uses correct auth key file and scopes", async () => {
    await run()
    expect(google.auth.GoogleAuth).toBeCalledWith({
      keyFile: "/.secrets/credentials.json",
      scopes: ["https://www.googleapis.com/auth/ndev.clouddns.readwrite"],
    })
    expect(google.options).toBeCalledWith({ auth })
  })

  test("Receiving a subscribed topics will issue an update for each process.env.SUB_DOMAINS to the IP address received in the message payload.", async () => {
    let messageHandler
    on.mockImplementation(async (type, cb) => {
      messageHandler = cb
    })
    const patch = jest.fn()
    when(google.dns).calledWith("v1").mockReturnValue({
      resourceRecordSets: {
        patch,
      },
    })

    process.env["EXTERNAL_SERVICES_DNS_UPDATER_SUB_DOMAINS"] = "sub1,sub2"
    await run()

    await messageHandler(
      "homeassistant/sensor/external_ip/set",
      Buffer.from("1.1.1.1", "utf8"),
    )
    expect(patch).toHaveBeenCalledWith({
      managedZone: "smith-simms-family",
      project: "home-automation-dns",
      name: `sub1.smith-simms.family.`,
      type: "A",
      requestBody: {
        name: `sub1.smith-simms.family.`,
        type: "A",
        ttl: 300,
        rrdatas: ["1.1.1.1"],
      },
    })
    expect(patch).toHaveBeenCalledWith({
      managedZone: "smith-simms-family",
      project: "home-automation-dns",
      name: `sub2.smith-simms.family.`,
      type: "A",
      requestBody: {
        name: `sub2.smith-simms.family.`,
        type: "A",
        ttl: 300,
        rrdatas: ["1.1.1.1"],
      },
    })
  })
})
