import { createHeartbeat } from "@ha/http-heartbeat"
import { logger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"
import reducer, {
  pollDiscovery,
  registerWithHomeAssistant,
  saga,
  setGuestWifiPassPhrase,
} from "./redux"
import { getNetworks } from "./redux/selectors"

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat()

    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducer, applyMiddleware(sagaMiddleware))
    store.subscribe(() => {
      logger.debug("State change", store.getState())
    })
    sagaMiddleware.run(saga)
    const mqtt = await createMqtt()
    mqtt.subscribe("homeassistant/restarted")
    mqtt.subscribe("homeassistant/sensor/+/set")
    const topicRegEx = /^homeassistant\/sensor\/guest_wifi_(.*)\/set$/
    mqtt.on("message", async (topic, payload) => {
      try {
        logger.info(`MQTT message recieved: ${topic}`)
        if (topic === "homeassistant/restarted") {
          const registeredNetworks = getNetworks(store.getState())
          registeredNetworks.forEach((network) => {
            store.dispatch(
              registerWithHomeAssistant(
                network.homeAssistantId,
                network.name,
                network.passPhrase,
              ),
            )
          })

          return
        }

        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }

        const homeAssistantId = `guest_wifi_${matches[1]}`
        const networks = getNetworks(store.getState())
        const network = networks.find(
          (network) => network.homeAssistantId === homeAssistantId,
        )

        if (!network) {
          logger.info(`No network found for ${homeAssistantId}`)
          return
        }
        logger.info("Networks found")
        console.dir(network)
        // logger.debug(JSON.stringify(network))
        const { passPhrase } = JSON.parse(payload.toString())
        store.dispatch(
          setGuestWifiPassPhrase(network, homeAssistantId, passPhrase),
        )
      } catch (error) {
        logger.error(error)
      }
    })

    store.dispatch(pollDiscovery())
  } catch (e) {
    logger.error(e)
  }
}

if (require.main === module) {
  run()
}

export default run
