import createDebugger from "debug"
import { connectAsync } from "async-mqtt"
import { createApolloFetch } from "apollo-fetch"

const debug = createDebugger("@ha/guest-wifi-renewal/index")
const {
  GRAPHQL_API_HOST,
  GRAPHQL_API_TOKEN,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
} = process.env

const gql = createApolloFetch({
  uri: `http://${GRAPHQL_API_HOST}`,
})
gql.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}
  }
  options.headers["Authorization"] = `Bearer ${GRAPHQL_API_TOKEN}`

  next()
})

const run = async () => {
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.subscribe("/homeassistant/guest/renew-devices")

  mqtt.on("message", async (topic) => {
    if (topic !== "/homeassistant/guest/renew-devices") {
      return
    }
    const renewedDevices = await gql({
      query: `mutation {
        renewGuestDevices {
          id
          name
        }
      }`,
    })
    debug(renewedDevices)
  })
}

run()
