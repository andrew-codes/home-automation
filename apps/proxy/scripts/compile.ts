import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const subDomainRedirects = await configurationApi.get(
    "proxy/sub-domain/redirects",
  )
  const subDomainConfigurations = JSON.parse(subDomainRedirects)
  const distNginx = path.join(__dirname, "..", "dist", "nginx")
  const distSites = path.join(distNginx, "sites-enabled")
  const distStream = path.join(distNginx, "stream", "enabled")
  sh.exec(`mkdir -p ${path.join(distNginx, "conf.d")};`, { silent: true })
  sh.exec(`mkdir -p ${distSites};`, { silent: true })
  sh.exec(`mkdir -p ${distStream};`, { silent: true })
  sh.cp(
    path.join(__dirname, "..", "src", "nginx", "nginx.conf"),
    path.join(distNginx, "nginx.conf"),
  )
  sh.cp(
    path.join(__dirname, "..", "src", "nginx", "conf.d", "optimize.conf"),
    path.join(distNginx, "conf.d", "optimize.conf"),
  )

  const confContents = `
${subDomainConfigurations.map(
    ({ subDomain, locations, proxy }) => `
server {
  server_name ${subDomain}.smith-simms.family;
  listen 80;
  if ($scheme != "https") {
    return 301 https://$host$request_uri;
  }
}

server {
  server_name ${subDomain}.smith-simms.family;
  listen 443 ssl;

  ssl_certificate /etc/letsencrypt/live/smith-simms.family-0001/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/smith-simms.family-0001/privkey.pem;
  ${locations.map(
      ({ from, to }) => `
  location ${from} {
    proxy_pass ${proxy}${to};
    proxy_pass_header Authorization;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Front-End-Https on;
    add_header Strict-Transport-Security "max-age=15552000";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_http_version 1.1;
    proxy_set_header Connection "upgrade";
  }
`,
    ).join(`
`)}
}`,
  ).join(`


`)}

server {
  listen 80 default_server;
  listen 443 default_server;

  ssl_certificate /etc/letsencrypt/live/smith-simms.family-0001/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/smith-simms.family-0001/privkey.pem;

  return 444;
}`
  await fs.writeFile(
    path.join(distSites, "01_sites.conf"),
    confContents,
    "utf8",
  )
  const streamContents = `
  
 map $ssl_preread_server_name:$server_port $upstream {
  ${subDomainConfigurations.map(
    (config) =>
      `${config.subDomain}.smith-simms.family:443 ${config.subDomain};`,
  ).join(`
  `)}
}
  ${subDomainConfigurations.map(
    ({ proxy, subDomain }) => `
upstream ${subDomain} {
  hash $remote_addr consistent;
  server ${proxy.replace(/^https?:\/\//, "").replace(/\/.*/, "")};
}
`,
  ).join(`
`)}
`
  await fs.writeFile(
    path.join(distStream, "01_sites.conf"),
    streamContents,
    "utf8",
  )
}

export default run
