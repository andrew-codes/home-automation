import createDebugger from "debug"
import { createMqtt } from "@ha/mqtt-client"
import { google, dns_v1 } from "googleapis"

const debug = createDebugger("@ha/external-services-dns-updater-app")
const { SUB_DOMAINS } = process.env

async function run() {
  debug("Started")
  const mqtt = await createMqtt()
  await mqtt.subscribe("homeassistant/sensor/external_ip/set")
  try {
    const subDomains = (SUB_DOMAINS ?? "").split(",")
    mqtt.on("message", async (topic, payload) => {
      try {
        const externalIP = payload.toString()
        const dns: dns_v1.Dns = google.dns("v1")
        await Promise.all(
          subDomains.map((subdomain) =>
            dns.resourceRecordSets.patch({
              managedZone: "smith-simms.family",
              project: "home-automation-dns",
              requestBody: {
                name: `${subdomain}.smith-simms.family.`,
                type: "A",
                ttl: 300,
                rrdatas: [externalIP],
              },
            })
          )
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