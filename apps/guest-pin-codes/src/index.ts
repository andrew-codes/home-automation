import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { connectAsync } from "async-mqtt"
import { createStore, applyMiddleware } from "redux"
import { CronJob, CronTime } from "cron"
import { defaultTo, first, merge } from "lodash"
import reducer from "./reducer"
import sagas from "./sagas"
import {
  getAvailableLocks,
  getLockEntries,
  getUnscheduledEvents,
} from "./selectors"
import {
  calendarEventScheduled,
  fetchNewCalendarEvents,
  setLockPin,
  unsetLockPin,
} from "./actionCreators"

const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env
const debug = createDebugger("@ha/guest-pin-codes/index")

const sagaMiddleware = createSagaMiddleware()

const run = async () => {
  debug("Started")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))

  store.subscribe(() => {
    debug("State Updated")
    debug(store.getState())
  })

  store.subscribe(() => {
    const state = store.getState()

    const newCalendarEvents = getUnscheduledEvents(state)

    newCalendarEvents
      .reduce((acc, calendarEvent) => {
        const startDateTime = defaultTo(
          calendarEvent.payload.calendarEvent.start.dateTime,
          calendarEvent.payload.calendarEvent.start.date
        )
        const calendarEventStart = new CronTime(startDateTime, async () => {
          try {
            const entity_id = first(getAvailableLocks(store.getState()))
            const mqttMessage = {
              payload: {
                entity_id,
              },
            }
            await mqtt.publish(
              "/homeassistant/guest-pin/set",
              JSON.stringify(
                merge({}, mqttMessage, { payload: { pin: calendarEvent.pin } })
              ),
              {
                qos: 2,
              }
            )
            store.dispatch(setLockPin(entity_id, calendarEvent.pin))

            // Publish PIN enabled
            await mqtt.publish(
              "/homeassistant/guest-pin/enable",
              JSON.stringify(mqttMessage),
              {
                qos: 2,
              }
            )
          } catch (error) {
            debug(error)
          }
        })

        const endDateTime = defaultTo(
          calendarEvent.payload.calendarEvent.start.dateTime,
          calendarEvent.payload.calendarEvent.start.date
        )
        const calendarEventOver = new CronTime(endDateTime, async () => {
          try {
            const lockEntry = getLockEntries(store.getState()).find(
              ([key, value]) => value === calendarEvent.pin
            )

            if (!lockEntry) {
              throw new Error(
                `Lock entry not found for calendar event: ${calendarEvent.id}`
              )
            }

            const entity_id = lockEntry[0]

            const mqttMessage = {
              payload: {
                // TODO: do not hardcode entity ID
                entity_id,
              },
            }
            // Publish PIN disabled
            await mqtt.publish(
              "/homeassistant/guest-pin/disable",
              JSON.stringify(mqttMessage),
              { qos: 2 }
            )
            store.dispatch(unsetLockPin(entity_id))
          } catch (error) {
            debug(error)
          }
        })

        store.dispatch(calendarEventScheduled(calendarEvent))
        return acc.concat([calendarEventStart, calendarEventOver])
      }, [])
      .forEach((job) => job.start())
  })

  sagaMiddleware.run(sagas)
  const checkForCalendarEvents = new CronJob(
    "*/5 * * * *",
    () => {
      store.dispatch(fetchNewCalendarEvents())
    },
    null,
    true,
    "America/New_York"
  )

  checkForCalendarEvents.start()
}

run()
