import createDebugger from "debug"
import { createMqtt } from "@ha/mqtt-client"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, { pollDiscovery, saga } from "./redux"

const debug = createDebugger("@ha/guest-wifi-updater")
const debugState = createDebugger("@ha/state")

async function run() {
  debug("Started")
  try {
    await createMqttHeartbeat(
      "home/guest-wifi-updater/hearbeat/request",
      "home/guest-wifi-updater/hearbeat/response",
    )
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducer, applyMiddleware(sagaMiddleware))
    store.subscribe(() => {
      debugState(JSON.stringify(store.getState(), null, 2))
    })
    sagaMiddleware.run(saga)
    const mqtt = await createMqtt()
    // const topicRegEx = /^homeassistant\/sensor\/(.*)\/set$/
    // mqtt.on("message", async (topic, payload) => {
    //   try {
    //     const matches = topicRegEx.exec(topic)
    //     if (!matches) {
    //       return
    //     }

    //     const homeAssistantId = matches[1]
    //     const networks = getNetworks(store.getState())
    //     const network = networks.find(
    //       (network) => network.homeAssistantId === homeAssistantId
    //     )

    //     if (!network) {
    //       return
    //     }
    //     debug(network)
    //     const passPhrase = payload.toString()
    //     debug(passPhrase)
    //     store.dispatch(
    //       setGuestWifiPassPhrase(network.id, homeAssistantId, passPhrase)
    //     )
    //   } catch (error) {
    //     debug(error)
    //   }
    // })

    store.dispatch(pollDiscovery())
  } catch (e) {
    debug(e)
  }
}

if (require.main === module) {
  run()
}

export default run
