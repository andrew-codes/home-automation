import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, { pollDiscovery, saga, setGuestWifiPassPhrase } from "./redux"
import { getNetworks } from "./redux/selectors"

const logger = createLogger()

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat("guest-registrar-service")
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducer, applyMiddleware(sagaMiddleware))
    store.subscribe(() => {
      logger.debug("State change", store.getState())
    })
    sagaMiddleware.run(saga)
    const mqtt = await createMqtt()
    const topicRegEx = /^homeassistant\/sensor\/guest_wifi_(.*)\/set$/
    mqtt.on("message", async (topic, payload) => {
      try {
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
          return
        }
        logger.debug(JSON.stringify(network))
        const passPhrase = payload.toString()
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
