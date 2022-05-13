import createDebugger from "debug"
import http from "http"
import { createMqtt } from "@ha/mqtt-client"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, { pollDiscovery, saga, setGuestWifiPassPhrase } from "./redux"

const debug = createDebugger("@ha/guest-wifi-updater-app")
const debugState = createDebugger("@ha/state")

async function run() {
  debug("Started")
  try {
    const healthEndpoint = http.createServer((request, response) => {
      response.statusCode = 200
      response.end()
    })

    healthEndpoint.listen(80, () => {
      console.info("Health endpoint is running at port 80...")
    })

    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducer, applyMiddleware(sagaMiddleware))
    store.subscribe(() => {
      debugState(JSON.stringify(store.getState(), null, 2))
    })
    sagaMiddleware.run(saga)
    const mqtt = await createMqtt()
    const topicRegEx = /^homeassistant\/sensor\/(.*)\/set$/
    mqtt.on("message", async (topic, payload) => {
      try {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }

        const homeAssistantId = matches[1]
        const passPhrase = payload.toString()
        store.dispatch(setGuestWifiPassPhrase(homeAssistantId, passPhrase))
      } catch (error) {
        debug(error)
      }
    })

    store.dispatch(pollDiscovery())
  } catch (e) {
    debug(e)
  }
}

if (require.main === module) {
  run()
}

export default run
