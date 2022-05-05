import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, {
  applyToDevice,
  discoverDevices,
  getDevices,
  pollDevices,
  pollDiscovery,
  saga,
} from "./redux"
import { createMqtt } from "@ha/mqtt-client"
import { SwitchStatus } from "./redux/types"

const debug = createDebugger("@ha/ps5-app")
const debugState = createDebugger("@ha/ps5-app/state")

async function run() {
  debug("Started")

  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))
  store.subscribe(() => {
    debugState(JSON.stringify(store.getState(), null, 2))
  })
  sagaMiddleware.run(saga)
  const mqtt = await createMqtt()

  const topicRegEx = /^homeassistant\/switch\/(.*)\/set$/
  mqtt.on("message", (topic, payload) => {
    if (topicRegEx.test(topic)) {
      const matches = topicRegEx.exec(topic)
      if (!matches) {
        return
      }
      const homeAssistantId = matches[1]
      const devices = getDevices(store.getState())
      const device = devices.find(
        (device) => device.homeAssistantId === homeAssistantId
      )
      const data = payload.toString()
      store.dispatch(applyToDevice(device, data as SwitchStatus))
    }
  })

  store.dispatch(pollDevices())
  store.dispatch(pollDiscovery())
}

if (require.main === module) {
  run()
}

export default run
