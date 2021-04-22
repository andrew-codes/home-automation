import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { connectAsync } from "async-mqtt"
import { createStore, applyMiddleware } from "redux"
import { CronJob } from "cron"
import { defaultTo, first, isEmpty, merge } from "lodash"
import reducer from "./reducer"
import sagas from "./sagas"
import {
  getAvailableLockSlots,
  getDoorLocks,
  getLockSlots,
  getUnscheduledEvents,
} from "./selectors"
import {
  addDoorLocks,
  calendarEventsScheduled,
  fetchNewCalendarEvents,
  setGuestSlots,
  setLockPin,
  unsetLockPin,
} from "./actionCreators"

const {
  DOOR_LOCKS,
  NUMBER_OF_GUEST_CODES,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
} = process.env
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

  const numberOfGuestCodes = parseInt(NUMBER_OF_GUEST_CODES as string, 10)
  debug(`Number of guest codes: ${numberOfGuestCodes}`)
  store.dispatch(setGuestSlots(numberOfGuestCodes))
  store.dispatch(addDoorLocks(DOOR_LOCKS?.split(",") ?? []))

  store.subscribe(() => {
    const state = store.getState()

    const newCalendarEvents = getUnscheduledEvents(state)
    if (isEmpty(newCalendarEvents)) {
      return
    }

    newCalendarEvents
      .reduce((acc: any[], calendarEvent: any) => {
        const startDateTime = defaultTo(
          calendarEvent.start.dateTime,
          calendarEvent.start.date
        )
        debug(`Scheduling calendar event at ${startDateTime}`)
        const calendarEventStart = new CronJob(
          new Date(startDateTime),
          async () => {
            try {
              const storeState = store.getState()
              const slotNumber = first(getAvailableLockSlots(storeState))
              const doorLocks = getDoorLocks(storeState)
              await Promise.all(
                doorLocks.map(async (door) => {
                  const doorId = `${door}_${slotNumber}`
                  await mqtt.publish(
                    "/homeassistant/guest-pin/set",
                    JSON.stringify({
                      entity_id: `input_text.${doorId}`,
                      pin: calendarEvent.pin,
                    }),
                    {
                      qos: 2,
                    }
                  )
                  await mqtt.publish(
                    "/homeassistant/guest-pin/enable",
                    JSON.stringify({
                      entity_id: `input_boolean.enabled_${doorId}`,
                    }),
                    {
                      qos: 2,
                    }
                  )
                })
              )
              store.dispatch(setLockPin(slotNumber, calendarEvent.pin))
            } catch (error) {
              debug(error)
            }
          },
          null,
          true,
          "America/New_York"
        )

        const endDateTime = defaultTo(
          calendarEvent.start.dateTime,
          calendarEvent.start.date
        )
        debug(`Scheduling calendar event end at ${endDateTime}`)
        const calendarEventOver = new CronJob(
          new Date(endDateTime),
          async () => {
            try {
              const storeState = store.getState()
              const lockEntry = getLockSlots(storeState).find(
                ([key, value]) => value === calendarEvent.pin
              )

              if (!lockEntry) {
                throw new Error(
                  `Lock entry not found for calendar event: ${calendarEvent.id}`
                )
              }

              const slotNumber = lockEntry[0]
              const doorLocks = getDoorLocks(storeState)
              await Promise.all(
                doorLocks.map(async (door) => {
                  const doorId = `${door}_${slotNumber}`
                  await mqtt.publish(
                    "/homeassistant/guest-pin/disable",
                    JSON.stringify({
                      entity_id: `input_boolean.enabled_${doorId}`,
                    }),
                    { qos: 2 }
                  )
                })
              )
              store.dispatch(unsetLockPin(slotNumber))
            } catch (error) {
              debug(error)
            }
          },
          null,
          true,
          "America/New_York"
        )
        return acc.concat([calendarEventStart, calendarEventOver])
      }, [])
      .forEach((job) => job.start())

    store.dispatch(calendarEventsScheduled(newCalendarEvents))
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

  store.dispatch(fetchNewCalendarEvents())
  // checkForCalendarEvents.start()
}

run()
