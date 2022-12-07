import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/http-heartbeat"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, { pollDiscovery, saga, updatePorters } from "./redux"
import { getNetworks } from "./redux/selectors"

const logger = createLogger()

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
    const topicRegEx = /^homeassistant\/sensor\/guest_wifi_(.*)\/set$/
    mqtt.on("message", async (topic, payload) => {
      try {
        logger.info(`MQTT message recieved: ${topic}`)
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
        logger.debug(JSON.stringify(network))
        const passPhrase = payload.toString()
        store.dispatch(updatePorters(network.name, passPhrase))
        // store.dispatch(
        //   setGuestWifiPassPhrase(network, homeAssistantId, passPhrase),
        // )
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
