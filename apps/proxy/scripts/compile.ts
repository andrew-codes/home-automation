import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const generateConfContents = (
  subDomainConfigurations: {
    subDomain: string
    locations: { from: string; to: string }[]
    proxy: string
    http1: boolean
    extra?: string[]
  }[],
) => `
${subDomainConfigurations.map(
  ({ subDomain, locations, proxy, http1, extra }) => `
server {
  server_name ${subDomain}.smith-simms.family;
  listen 80;
  if ($scheme != "https") {
    return 301 https://$host$request_uri;
  }
}

server {
  server_name ${subDomain}.smith-simms.family;
  listen 443 ssl ${http1 ? "" : "http2"};

  ssl_certificate /etc/letsencrypt/live/smith-simms.family/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/smith-simms.family/privkey.pem;
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
    ${
      !!extra
        ? extra?.map((value) => `${value.replace(";", "")};`).join(`
    `)
        : ""
    }
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

  ssl_certificate /etc/letsencrypt/live/smith-simms.family/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/smith-simms.family/privkey.pem;

  return 444;
}`

const generateStreamConf = (
  subDomainConfigurations: {
    subDomain: string
    locations: { from: string; to: string }[]
    proxy: string
  }[],
) => `
  
map $ssl_preread_server_name:$server_port $upstream {
 ${subDomainConfigurations.map(
   ({ subDomain }) => `${subDomain}.smith-simms.family:443 ${subDomain};`,
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

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const dist = path.join(__dirname, "..", "dist")
  const distInternal = path.join(dist, "proxy-internal", "nginx")
  const distSitesInternal = path.join(distInternal, "sites-enabled")
  const distStreamInternal = path.join(distInternal, "stream", "enabled")
  const dirs = [
    distSitesInternal,
    distStreamInternal,
  ].forEach((dir) => {
    sh.exec(`mkdir -p ${dir};`, { silent: true })
  })

  const internalSubDomainRedirects = await configurationApi.get(
    "proxy-internal/sub-domain/redirects",
  )
  const internalSubDomainConfigurations = JSON.parse(
    internalSubDomainRedirects.value,
  )
  const proxyInternalConf = generateConfContents(
    internalSubDomainConfigurations,
  )
  await fs.writeFile(
    path.join(distSitesInternal, "01_sites_internal.conf"),
    proxyInternalConf,
    "utf8",
  )
  const proxyInternalStreamConf = generateStreamConf(
    internalSubDomainConfigurations,
  )
  await fs.writeFile(
    path.join(distStreamInternal, "01_sites_internal.conf"),
    proxyInternalStreamConf,
    "utf8",
  )
}

export default run
