import cp from "child_process"
import { readFile } from "fs/promises"
import path from "path"

const { UNIFI_IP, UNIFI_PORT, UNIFI_PASSWORD, UNIFI_USERNAME } = process.env
const unifiPort = parseInt(UNIFI_PORT || "8443", 10)

interface Controller {
  authorizeGuest: (mac: string, minutes: number) => void
  getWLanSettings: () => any
  setWLanSettings: (network: string, passPhrase: string) => void
}

let client: Controller | null

const createUnifi = async (
  host: string | undefined = UNIFI_IP,
  port: number | undefined = unifiPort,
  username: string | undefined = UNIFI_USERNAME,
  password: string | undefined = UNIFI_PASSWORD,
): Promise<Controller> => {
  let csrfToken: string | null = null

  const getToken = async () => {
    console.log(host, port)
    if (csrfToken) {
      return csrfToken
    }
    cp.execSync(
      `rm -f ${path.join(process.cwd(), "headers.txt")} ${path.join(
        process.cwd(),
        "cookies.txt",
      )}`,
    )
    console.log(
      cp.execSync(
        `curl -k -D headers.txt -X POST --header "Content-Type: application/json" --data '{"username": "${username}", "password": "${password}"}' -b cookies.txt -c cookies.txt https://${host}:${port}/api/auth/login`,
      ),
    )
    const headersText = await readFile(
      path.join(process.cwd(), "headers.txt"),
      "utf8",
    )
    const headers = headersText.split("\n")
    const csrfHeader =
      headers.find((header) => header.includes("x-csrf-token")) ?? ":"
    const [, token] = csrfHeader.split(":") ?? ["x-csrf-token", ""]

    return new Promise((resolve) => {
      if (!token) {
        console.log(`No CSRF token found in header.`)
        setTimeout(() => {
          getToken().then(resolve)
        }, 30000)

        return
      }

      csrfToken = token
      setTimeout(() => {
        csrfToken = null
      }, 7200000)
      resolve(token)
    })
  }

  if (!client) {
    client = {
      authorizeGuest: async (mac: string, minutes: number) => {
        const csrfToken = await getToken()

        cp.execSync(
          `curl -k -X POST --header "Content-Type: application/json" --header "x-csrf-token: ${csrfToken}" --data '{"cmd":"authorize-guest", "mac": "${mac}", "minutes": ${minutes} }' -b cookies.txt -c cookies.txt https://${host}:${port}/proxy/network/api/s/default/cmd/stamgr`,
        )
      },
      getWLanSettings: async () => {
        const csrfToken = await getToken()

        const response = cp.execSync(
          `curl -k -X GET --header "Content-Type: application/json" --header "x-csrf-token: ${csrfToken}" -b cookies.txt -c cookies.txt https://${host}:${port}/proxy/network/api/s/default/rest/wlanconf`,
        )

        return JSON.parse(response.toString()).data
      },
      setWLanSettings: async (networkId, passPhrase) => {
        const csrfToken = await getToken()

        cp.execSync(
          `curl -k -X PUT --header "Content-Type: application/json" --header "x-csrf-token: ${csrfToken}" --data '${passPhrase}' -b cookies.txt -c cookies.txt https://${host}:${port}/proxy/network/api/s/default/rest/wlanconf/${networkId}`,
        )
      },
    }
  }

  return client
}

export type { Controller }
export { createUnifi }
