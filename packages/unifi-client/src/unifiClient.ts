import { Controller } from "node-unifi"

const { UNIFI_IP, UNIFI_PORT, UNIFI_PASSWORD, UNIFI_USERNAME } = process.env
const unifiPort = parseInt(UNIFI_PORT || "8443", 10)

let client: Controller

const createUnifi = async (
  host: string | undefined = UNIFI_IP,
  port: number | undefined = unifiPort,
  username: string | undefined = UNIFI_USERNAME,
  password: string | undefined = UNIFI_PASSWORD,
): Promise<Controller> => {
  if (!client) {
    client = new Controller({
      host,
      port: port.toString(),
      sslverify: false,
    })
    await client.login(username, password)
  }

  client.authorizeGuest = async (mac: string, minutes: number) => {
    const authorizeResponse = await fetch(
      `https://${host}:${port}/api/auth/login`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      },
    )

    const csrfToken = authorizeResponse.headers.get("x-csrf-token") ?? ""

    await fetch(
      `https://${host}:${port}/proxy/network/api/s/default/cmd/stamgr`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          cmd: "authorize-guest",
          mac: mac.toLowerCase(),
        }),
      },
    )

    return
  }

  return client
}

export type { Controller }
export { createUnifi }
