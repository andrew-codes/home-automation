import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware } from "redux"
import { CronJob } from "cron"
import candiateCodes from "./candidateCodes"
import reducer from "./reducer"
import sagas from "./sagas"
import {
  addCodesToPool,
  addDoorLocks,
  scheduleEvents,
  fetchEvents,
  setGuestSlots,
} from "./actionCreators"
import { shuffle } from "./shuffle"

const {
  DOOR_LOCKS,
  GUEST_CODE_INDEX_OFFSET,
  GUEST_LOCK_CODE_EXCLUSIONS,
  NUMBER_OF_GUEST_CODES,
} = process.env
const debug = createDebugger("@ha/guest-pin-codes/index")

const sagaMiddleware = createSagaMiddleware()

const run = async () => {
  debug("Started")

  const store = createStore(reducer, applyMiddleware(sagaMiddleware))

  store.subscribe(() => {
    debug("State Updated")
    // debug(store.getState())
  })

  const numberOfGuestCodes = parseInt(NUMBER_OF_GUEST_CODES as string, 10)
  const guestCodeOffset = parseInt(GUEST_CODE_INDEX_OFFSET as string, 10)
  debug(
    `Number of guest codes: ${numberOfGuestCodes}, offset by ${guestCodeOffset}`
  )
  store.dispatch(setGuestSlots(numberOfGuestCodes, guestCodeOffset))
  store.dispatch(addDoorLocks(DOOR_LOCKS?.split(",") ?? []))

  const exclusionCodes = GUEST_LOCK_CODE_EXCLUSIONS?.split(",") ?? []
  const codes = candiateCodes.filter((code) => !exclusionCodes.includes(code))
  store.dispatch(addCodesToPool(shuffle(codes)))

  // store.subscribe(() => {
  //   try {
  //     const state = store.getState()

  //     const newCalendarEvents = getUnscheduledEvents(state)
  //     if (isEmpty(newCalendarEvents)) {
  //       return
  //     }

  //     newCalendarEvents
  //       .reduce((acc: any[], calendarEvent: any) => {
  //         const startDateTime = defaultTo(
  //           calendarEvent.start.dateTime,
  //           calendarEvent.start.date
  //         )
  //         const start = new Date(startDateTime)
  //         debug(`Start (${start.getTime()}), now (${Date.now()})`)
  //         if (start.getTime() > Date.now()) {
  //           debug(`Scheduling calendar event at ${startDateTime}`)
  //           const calendarEventStart = new CronJob(
  //             start,
  //             async () => {
  //               try {
  //                 const storeState = store.getState()
  //                 const events = getEventList(
  //                   state
  //                 ) as calendar_v3.Schema$Event[]
  //                 const event = events.find(({ id }) => id === calendarEvent.id)
  //                 if (!event) {
  //                   debug(`Removed event: ${calendarEvent.id}`)
  //                   return
  //                 }

  //                 const eventStart = new Date(
  //                   defaultTo(event.start?.dateTime, event.start?.date)
  //                 )
  //                 if (eventStart !== start) {
  //                   debug(
  //                     `Event start time has moved for event ${
  //                       calendarEvent.id
  //                     } from ${start.toLocaleTimeString()} to ${eventStart.toLocaleTimeString()}`
  //                   )
  //                   return
  //                 }

  //                 debug(
  //                   `Setting and enabling PIN for event ${calendarEvent.summary}`
  //                 )
  //                 const slotNumber = first(getAvailableLockSlots(storeState))
  //                 const doorLocks = getDoorLocks(storeState)
  //                 await Promise.all(
  //                   doorLocks.map(async (door) => {
  //                     const doorPinId = `${door}_pin_${slotNumber}`
  //                     await mqtt.publish(
  //                       "/homeassistant/guest-pin/set",
  //                       JSON.stringify({
  //                         entity_id: `input_text.${doorPinId}`,
  //                         pin: calendarEvent.pin,
  //                       }),
  //                       {
  //                         qos: 2,
  //                       }
  //                     )
  //                     await mqtt.publish(
  //                       "/homeassistant/guest-pin/enable",
  //                       JSON.stringify({
  //                         entity_id: `input_boolean.enabled_${door}_${slotNumber}`,
  //                       }),
  //                       {
  //                         qos: 2,
  //                       }
  //                     )
  //                   })
  //                 )
  //                 store.dispatch(setLockPin(slotNumber, calendarEvent.pin))
  //               } catch (error) {
  //                 debug(error)
  //               }
  //             },
  //             null,
  //             true,
  //             "America/New_York"
  //           )
  //           acc.push(calendarEventStart)
  //         }

  //         const endDateTime = defaultTo(
  //           calendarEvent.end.dateTime,
  //           calendarEvent.end.date
  //         )
  //         const end = new Date(endDateTime)
  //         if (end.getTime() > Date.now()) {
  //           debug(`Scheduling calendar event end at ${endDateTime}`)
  //           const calendarEventOver = new CronJob(
  //             end,
  //             async () => {
  //               try {
  //                 const storeState = store.getState()
  //                 const events = getEventList(
  //                   state
  //                 ) as calendar_v3.Schema$Event[]
  //                 const event = events.find(({ id }) => id === calendarEvent.id)
  //                 if (!event) {
  //                   debug(`Removed event: ${calendarEvent.id}`)
  //                   return
  //                 }

  //                 const eventEnd = new Date(
  //                   defaultTo(event.end?.dateTime, event.end?.date)
  //                 )
  //                 if (eventEnd !== end) {
  //                   debug(
  //                     `Event end time has moved for event ${
  //                       calendarEvent.id
  //                     } from ${end.toLocaleTimeString()} to ${eventEnd.toLocaleTimeString()}`
  //                   )
  //                   return
  //                 }

  //                 debug(`Disabling PIN for event ${calendarEvent.summary}`)
  //                 const lockSlots = getLockSlots(storeState)
  //                 debug(lockSlots)
  //                 const lockEntry = lockSlots.find(
  //                   ([key, value]) => value === calendarEvent.pin
  //                 )

  //                 if (!lockEntry) {
  //                   throw new Error(
  //                     `Lock entry not found for calendar event: ${calendarEvent.id}`
  //                   )
  //                 }

  //                 const slotNumber = lockEntry[0]
  //                 const doorLocks = getDoorLocks(storeState)
  //                 await Promise.all(
  //                   doorLocks.map(async (door) => {
  //                     const doorId = `${door}_${slotNumber}`
  //                     await mqtt.publish(
  //                       "/homeassistant/guest-pin/disable",
  //                       JSON.stringify({
  //                         entity_id: `input_boolean.enabled_${doorId}`,
  //                       }),
  //                       { qos: 2 }
  //                     )
  //                   })
  //                 )
  //                 store.dispatch(unsetLockPin(slotNumber))
  //                 store.dispatch(removeCalendarEvents([calendarEvent]))
  //               } catch (error) {
  //                 debug(error)
  //               }
  //             },
  //             null,
  //             true,
  //             "America/New_York"
  //           )
  //           acc.push(calendarEventOver)
  //         }

  //         return acc
  //       }, [])
  //       .forEach((job) => job.start())

  //     store.dispatch(calendarEventsScheduled(newCalendarEvents))
  //   } catch (e) {
  //     debug(e)
  //   }
  // })

  sagaMiddleware.run(sagas)

  const fetchEventsJob = new CronJob(
    "*/5 * * * *",
    () => {
      store.dispatch(fetchEvents(new Date()))
    },
    null,
    true,
    "America/New_York"
  )
  const scheduledEventsJob = new CronJob(
    "*/1 * * * *",
    () => {
      store.dispatch(scheduleEvents(new Date()))
    },
    null,
    true,
    "America/New_York"
  )

  const now = new Date()
  store.dispatch(fetchEvents(now))
  store.dispatch(scheduleEvents(now))
  fetchEventsJob.start()
  scheduledEventsJob.start()
}

run()
