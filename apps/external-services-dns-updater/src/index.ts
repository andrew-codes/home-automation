import createDebugger from "debug"
import { createMqtt } from "@ha/mqtt-client"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"
import { google, dns_v1 } from "googleapis"

const debug = createDebugger("@ha/external-services-dns-updater/index")

async function run() {
  debug("Started")
  await createMqttHeartbeat("external-services-dns-updater-service")
  const mqtt = await createMqtt()
  await mqtt.subscribe("homeassistant/sensor/external_ip/set")
  try {
    const { "EXTERNAL_SERVICES_DNS_UPDATER_SUB_DOMAINS": SUB_DOMAINS } =
      process.env
    const subDomains = (SUB_DOMAINS ?? "").split(",")

    const auth = new google.auth.GoogleAuth({
      keyFile: "/.secrets/credentials.json",
      scopes: ["https://www.googleapis.com/auth/ndev.clouddns.readwrite"],
    })
    google.options({
      auth,
    })

    mqtt.on("message", async (topic, payload) => {
      try {
        const externalIP = payload.toString()
        const dns: dns_v1.Dns = google.dns("v1")
        await Promise.all(
          subDomains.map((subdomain) =>
            dns.resourceRecordSets.patch({
              managedZone: "smith-simms-family",
              project: "home-automation-dns",
              name: `${subdomain}.smith-simms.family.`,
              type: "A",
              requestBody: {
                name: `${subdomain}.smith-simms.family.`,
                type: "A",
                ttl: 300,
                rrdatas: [externalIP],
              },
            }),
          ),
        )
      } catch (error) {
        debug(error)
      }
    })
  } catch (e) {
    debug(e)
  }
}

if (require.main === module) {
  run()
}

export default run
