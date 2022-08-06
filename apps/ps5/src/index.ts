import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, {
  applyToDevice,
  getDeviceRegistry,
  pollDevices,
  pollDiscovery,
  saga,
} from "./redux"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import { SwitchStatus } from "./redux/types"

const debug = createDebugger("@ha/ps5/index")
const debugState = createDebugger("@ha/state")

async function run() {
  debug("Started")
  try {
    await createHeartbeat("ps5")

    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducer, applyMiddleware(sagaMiddleware))
    store.subscribe(() => {
      debugState(JSON.stringify(store.getState(), null, 2))
    })
    sagaMiddleware.run(saga)
    const mqtt = await createMqtt()

    const topicRegEx = /^playstation\/([^/]*)\/set\/(.*)$/
    mqtt.on("message", (topic, payload) => {
      if (topicRegEx.test(topic)) {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }
        const [, deviceId, deviceProperty] = matches
        const devices = getDeviceRegistry(store.getState())
        const device = devices[deviceId]
        if (!device || deviceProperty !== 'power') {
          return
        }
        const data = payload.toString()
        store.dispatch(applyToDevice(device, data as SwitchStatus))
      }
    })

    await mqtt.subscribe('playstation/#')

    store.dispatch(pollDevices())
    store.dispatch(pollDiscovery())
  } catch (e) {
    debug(e)
  }
}

if (require.main === module) {
  run()
}

export default run
