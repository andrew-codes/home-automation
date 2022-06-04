import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name, image } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port = await configurationApi.get("captive-portal/port/external")
  const unifiIp = await configurationApi.get("unifi/ip")
  const host = await configurationApi.get("captive-portal/host")
  const secrets: Array<keyof Configuration> = [
    "mqtt/password",
    "mqtt/username",
    "unifi/ip",
    "unifi/port",
    "unifi/password",
    "unifi/username",
  ]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image,
      name,
      secrets: JSON.stringify(secrets),
      port: parseInt(port),
    },
  )
  const resourceJson = JSON.parse(resources)
  Object.values(resourceJson).forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)

  const unifiCaptivePortal = `<!DOCTYPE html>
  <html>
    <head>
      <title>Smith-Simms Wifi</title>
      <meta http-equiv="refresh" content="0;url=http://${host}?mac=<unifi var="mac" />">
    </head>
    <body>
    </body>
  </html>`
  await fs.mkdir(path.join(__dirname, "..", ".secrets"), { recursive: true })
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "unifi.html"),
    unifiCaptivePortal,
    "utf8",
  )
  const { stdout, stderr } = sh.exec(
    `scp ${path.join(
      __dirname,
      "..",
      ".secrets",
      "unifi.html",
    )} "root@${unifiIp}:/data/unifi/data/sites/default/app-unifi-hotspot-portal/index.html"`,
  )
  console.log(stdout)
}

export default run
