import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import { createStore, RootState } from "./state"
import { getKnownPlayStations, turnedOff, turnedOn } from "./state/device.slice"
import { startedPolling } from "./state/polling.slice"

const logger = createLogger()

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat("ps5")

    const preloadedState: RootState = {
      device: {
        devices: {},
      },
      polling: {
        isPolling: false,
        lastPoll: null,
      },
    }
    const store = createStore(preloadedState)

    const mqtt = await createMqtt()

    const topicRegEx = /^playstation\/([^/]*)\/set\/(.*)$/
    mqtt.on("message", (topic, payload) => {
      try {
        if (topicRegEx.test(topic)) {
          const matches = topicRegEx.exec(topic)
          if (!matches) {
            return
          }
          logger.info(`MQTT topic message received: ${topic}`)
          logger.debug(payload.toString())
          const [, deviceId, deviceProperty] = matches
          const knownPlayStations = getKnownPlayStations(store.getState())
          const playStation = knownPlayStations.find((ps) => ps.id === deviceId)
          if (!playStation || deviceProperty !== "power") {
            logger.info("No device or deviceProperty is not set to power")
            return
          }
          const data = payload.toString()
          if (data === "STANDBY") {
            store.dispatch(turnedOff({ id: deviceId }))
          } else {
          }
          store.dispatch(turnedOn({ id: deviceId }))
        }
      } catch (error) {
        logger.debug("MQTT message failed to process.")
        logger.error(error)
      }
    })

    await mqtt.subscribe("playstation/#")
    store.dispatch(startedPolling())
  } catch (e) {
    logger.error(e)
  }
}

if (require.main === module) {
  run()
}

export default run
