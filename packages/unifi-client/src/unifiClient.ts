import { readFile } from "fs/promises"
import { Controller } from "node-unifi"
import { throwIfError } from "@ha/shell-utils"
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
    cp.exec("rm -f headers.txt cookies.txt")
    const authorize = cp.exec(
      `curl -k -D headers.txt -X POST --data '{"username": "${username}", "password": "${password}"}' --header 'Content-Type: application/json' https://${host}:${port}/api/auth/login -b cookies.txt -c cookies.txt`,
    )
    throwIfError({
      stdout: authorize.stdout,
      stderr: authorize.stderr,
      code: authorize.exitCode,
    })
    const headersText = await readFile(
      path.join(__dirname, "headers.txt"),
      "utf8",
    )
    const headers = headersText.split("\n")
    const csrfHeader =
      headers.find((header) => header.includes("x-csrf-token")) ?? ":"
    const [, csrfToken] = csrfHeader.split(":") ?? ["x-csrf-token", ""]

    if (!csrfToken) {
      throw new Error(`No CSRF token found in header.
    ${headersText}`)
    }

    const authorizeGuest = cp.exec(
      `curl -k -X POST https://${host}:${port}/proxy/network/api/s/default/cmd/stamgr --data '{"cmd":"authorize-guest", "mac": "${mac}"}' -H "x-csrf-token: ${csrfToken}" -b cookies.txt`,
    )
    throwIfError({
      stdout: authorizeGuest.stdout,
      stderr: authorizeGuest.stderr,
      code: authorizeGuest.exitCode,
    })
  }

  return client
}

export type { Controller }
export { createUnifi }
