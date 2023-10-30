import { configureStore } from "@reduxjs/toolkit"
import { CronJob } from "cron"
import createDebugger from "debug"
import { merge } from "lodash"
import { filter, flow } from "lodash/fp"
import { WithId } from "mongodb"
import { type Store } from "redux"
import createSagaMiddleware from "redux-saga"
import {
  addDoorLocks,
  assignEvent,
  createGuestSlots,
  fetchEvents,
  removeEvent,
  setPinsInPool,
} from "./actionCreators"
import candidateCodes from "./candidateCodes"
import getClient from "./dbClient"
import reducer, { type CalendarEvent } from "./reducer"
import sagas from "./sagas"
import { getEvents, getOpenSlots } from "./selectors"

const debug = createDebugger("@ha/guest-pin-codes/app")

const notStartedEvents = filter<CalendarEvent>((calendarEvent) => {
  const now = new Date()
  return new Date(calendarEvent.start) >= now
})

const eventsStartingBeforeAnHourFromNow = filter<CalendarEvent>(
  (calendarEvent) => {
    const now = new Date()
    now.setTime(now.getTime() + 60 * 60 * 1000)
    return new Date(calendarEvent.start).getTime() <= now.getTime()
  },
)

const onlyUpcomingEvents = flow([
  notStartedEvents,
  eventsStartingBeforeAnHourFromNow,
])

const onlyPastEvents = filter<CalendarEvent>((calendarEvent) => {
  const now = new Date()
  return new Date(calendarEvent.end) <= now
})

const app = async (
  doorLocks: string,
  numberOfGuestCodes: number,
  calendarId: string,
): Promise<{ store: Store; start: () => Promise<void> }> => {
  debug("Started")
  const dbClient = await getClient()
  const guestEvents = dbClient.db("guests").collection("events")
  const events = await guestEvents
    .find<WithId<Document> & CalendarEvent>({ calendarId })
    .toArray()
  const eventState = notStartedEvents(events).reduce(
    (acc, event) =>
      merge({}, acc, {
        [`${event.calendarId}:${event.eventId}`]: event,
      }),
    {},
  )

  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    reducer,
    middleware: (gDm) => gDm().concat(sagaMiddleware),
    preloadedState: {
      events: eventState,
    },
  })
  sagaMiddleware.run(sagas)

  debug(`Number of guest slots: ${numberOfGuestCodes}`)
  store.dispatch(createGuestSlots(numberOfGuestCodes))
  store.dispatch(addDoorLocks(doorLocks.split(",").filter((lock) => !!lock)))
  store.dispatch(setPinsInPool(candidateCodes()))

  return {
    store,
    start: async () => {
      const fetchEventsJob = new CronJob(
        "*/5 * * * *",
        () => {
          debug("Fetching events")
          store.dispatch(fetchEvents(calendarId))
        },
        null,
        true,
        process.env.TZ ?? "America/New_York",
      )

      const updateEventAssignments = new CronJob(
        "*/1 * * * *",
        () => {
          debug("Updating event assignments")
          const state = store.getState()
          const events = getEvents(state)

          const pastEvents = onlyPastEvents(events)
          pastEvents.forEach((pastEvent) => {
            debug(`Removing ${pastEvent.eventId}`)
            store.dispatch(removeEvent(pastEvent))
          })

          const slots = getOpenSlots(state)
          const upcomingEvents = onlyUpcomingEvents(events)
          slots.forEach(([slotId], index) => {
            const upcomingEvent = upcomingEvents[index]
            if (!upcomingEvent) {
              return
            }

            debug(`Assigning ${upcomingEvent.eventId} to ${slotId}`)
            store.dispatch(assignEvent(slotId, upcomingEvents[index]))
          })
        },
        null,
        true,
        process.env.TZ ?? "America/New_York",
      )

      store.dispatch(fetchEvents(calendarId))

      fetchEventsJob.start()
      updateEventAssignments.start()
    },
  }
}

export default app
