import { createLogger } from "@ha/logger"
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

const logger = createLogger()

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat("ps5")

    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducer, applyMiddleware(sagaMiddleware))
    store.subscribe(() => {
      logger.debug('State change', store.getState())
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
        logger.info('MQTT message', topic, payload.toString())
        const [, deviceId, deviceProperty] = matches
        const devices = getDeviceRegistry(store.getState())
        const device = devices[deviceId]
        if (!device || deviceProperty !== 'power') {
          logger.info('No device or deviceProperty is not set to power')
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
    logger.error(e)
  }
}

if (require.main === module) {
  run()
}

export default run
