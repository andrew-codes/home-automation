import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = await configurationApi.get("proxy/ip")
  const ipInternal = await configurationApi.get("proxy-internal/ip")
  const certEmail = await configurationApi.get("proxy/ddns/cert-email")
  const dnsCredentials = await configurationApi.get(
    "proxy/ddns/service-account/credentials-json",
  )
  const sshPublicKey = await configurationApi.get(
    "home-assistant/ssh-key/public",
  )

  await sh.mkdir(`${path.join(__dirname, "..", ".secrets")}`)

  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ansible-secrets.yml"),
    `---
cert_email: "${certEmail.value}"`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts.yml"),
    `
all:
  vars:
    ansible_user: root
  hosts:
    ${ip.value}:`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "hosts-internal.yml"),
    `
all:
  vars:
    ansible_user: root
  hosts:
    ${ipInternal.value}:`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "creds.ini"),
    `${dnsCredentials.value}`,
    "utf8",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "ha.pub"),
    `${sshPublicKey.value}`,
    "utf8",
  )

  const k8sIp = await configurationApi.get("k8s/main-node/ip")
  const crowdsecApiPort = await configurationApi.get(
    "crowdsec/api/port/external",
  )
  const crowdsecApiKey = await configurationApi.get(
    "crowdsec/bouncer/nginx/key",
  )
  await fs.writeFile(
    path.join(__dirname, "..", ".secrets", "crowdsec-nginx-bouncer.conf"),
    `
API_URL=http://${k8sIp.value}:${crowdsecApiPort.value}
API_KEY=${crowdsecApiKey.value}
# bounce for all type of remediation that the bouncer can receive from the local API
BOUNCING_ON_TYPE=all
# when the bouncer receive an unknown remediation, fallback to this remediation
FALLBACK_REMEDIATION=ban
MODE=stream
REQUEST_TIMEOUT=1000
# exclude the bouncing on those location
EXCLUDE_LOCATION=
# Cache expiration in live mode, in second
CACHE_EXPIRATION=1
# Update frequency in stream mode, in second
UPDATE_FREQUENCY=10
#those apply for "ban" action
# REDIRECT_LOCATION and BAN_TEMPLATE_PATH/RET_CODE can't be used together. REDIRECT_LOCATION take priority over RET_CODE AND BAN_TEMPLATE_PATH
BAN_TEMPLATE_PATH=/var/lib/crowdsec/lua/templates/ban.html
REDIRECT_LOCATION=
RET_CODE=
#those apply for "captcha" action
#valid providers are recaptcha, hcaptcha, turnstile
# CAPTCHA_PROVIDER=
# # default is recaptcha to ensure backwards compatibility
# # Captcha Secret Key
# SECRET_KEY=
# # Captcha Site key
# SITE_KEY=
# CAPTCHA_TEMPLATE_PATH=/var/lib/crowdsec/lua/templates/captcha.html
# CAPTCHA_EXPIRATION=3600`,
  )

  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  sh.exec(
    `ansible-playbook ${path.join(
      __dirname,
      "..",
      "deployment",
      "proxy-external.yml",
    )} -i ${path.join(
      __dirname,
      "..",
      ".secrets",
      "hosts.yml",
    )} --extra-vars "nginxDir='proxy'"`,
  )

  sh.exec(
    `ansible-playbook ${path.join(
      __dirname,
      "..",
      "deployment",
      "proxy-internal.yml",
    )} -i ${path.join(
      __dirname,
      "..",
      ".secrets",
      "hosts-internal.yml",
    )} --extra-vars "nginxDir='proxy-internal'"`,
  )
}

export default run
