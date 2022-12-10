import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/http-heartbeat"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import reducer, { addGuest, saga, updateHomeAssistantWithGuests } from "./redux"

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
    store.dispatch(updateHomeAssistantWithGuests())
    const mqtt = await createMqtt()
    const restartTopic = "homeassistant/restarted"
    const addGuestTopic = "homeassistant/group/guests/add"
    const debugStateTopic = "guest-registrar/debug/state"
    mqtt.on("message", async (topic, payload) => {
      try {
        logger.info(`MQTT message recieved: ${topic}`)
        switch (topic) {
          case restartTopic:
            store.dispatch(updateHomeAssistantWithGuests())
            break
          case addGuestTopic:
            store.dispatch(addGuest(payload.toString()))
            break
          case debugStateTopic:
            logger.debug(JSON.stringify(store.getState(), null, 2))
            break
          default:
        }
      } catch (error) {
        logger.error(error)
      }
    })

    mqtt.subscribe(restartTopic)
    mqtt.subscribe(addGuestTopic)
    mqtt.subscribe(debugStateTopic)
  } catch (e) {
    logger.error(e)
  }
}

if (require.main === module) {
  run()
}

export default run
