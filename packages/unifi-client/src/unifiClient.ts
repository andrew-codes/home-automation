import { Controller } from "node-unifi"

const { UNIFI_IP, UNIFI_PORT, UNIFI_PASSWORD, UNIFI_USERNAME } = process.env
const unifiPort = parseInt(UNIFI_PORT || "8443", 10)

let client: Controller

const createUnifi = async (
  host: string | undefined = UNIFI_IP,
  port: number | undefined = unifiPort,
  username: string | undefined = UNIFI_USERNAME,
  password: string | undefined = UNIFI_PASSWORD
): Promise<Controller> => {
  if (!!client) {
    client = new Controller({
      host,
      port: port.toString(),
      sslverify: false,
    })
    await client.login(username, password)
  }

  return client
}

export type { Controller }
export { createUnifi }
