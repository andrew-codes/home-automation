import { readFile } from "fs/promises"
import { Controller } from "node-unifi"
import path from "path"
import cp from "child_process"

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
    cp.execSync("rm -f headers.txt cookies.txt")
    cp.execSync(
      `curl -k -D headers.txt -X POST --header "Content-Type: application/json" --data '{"username": "${username}", "password": "${password}"}' -b cookies.txt -c cookies.txt https://${host}:${port}/api/auth/login`,
    )
    const headersText = await readFile("headers.txt", "utf8")
    const headers = headersText.split("\n")
    const csrfHeader =
      headers.find((header) => header.includes("x-csrf-token")) ?? ":"
    const [, csrfToken] = csrfHeader.split(":") ?? ["x-csrf-token", ""]

    if (!csrfToken) {
      throw new Error(`No CSRF token found in header.
    ${headersText}`)
    }

    cp.execSync(
      `curl -k -X POST --header "Content-Type: application/json" --header "x-csrf-token: ${csrfToken}" --data '{"cmd":"authorize-guest", "mac": "${mac}"}' -b cookies.txt -c cookies.txt https://${host}:${port}/proxy/network/api/s/default/cmd/stamgr`,
    )
  }

  return client
}

export type { Controller }
export { createUnifi }
