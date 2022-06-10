import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  // const subDomainRedirects = await configurationApi.get(
  //   "proxy/subdomain/redirects",
  // )
  const distNginx = path.join(__dirname, "..", "dist", "nginx")
  const distSites = path.join(distNginx, "sites-enabled")
  const distStream = path.join(distNginx, "stream", "enabled")
  sh.exec(`mkdir -p ${path.join(distNginx, "conf.d")};`)
  sh.exec(`mkdir -p ${distSites};`)
  sh.exec(`mkdir -p ${distStream};`)
  sh.cp(
    path.join(__dirname, "..", "src", "nginx", "nginx.conf"),
    path.join(distNginx, "nginx.conf"),
  )
  sh.cp(
    path.join(__dirname, "..", "src", "nginx", "conf.d", "optimize.conf"),
    path.join(distNginx, "conf.d", "optimize.conf"),
  )
}

export default run
