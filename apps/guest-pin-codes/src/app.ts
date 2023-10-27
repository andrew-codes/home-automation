import { CronJob } from "cron"
import createDebugger from "debug"
import { WithId } from "mongodb"
import { applyMiddleware, createStore, Store } from "redux"
import createSagaMiddleware from "redux-saga"
import {
  addDoorLocks,
  createGuestSlots,
  fetchEvents,
  setPinsInPool,
} from "./actionCreators"
import candidateCodes from "./candidateCodes"
import getClient from "./dbClient"
import reducer, { type CalendarEvent } from "./reducer"
import sagas from "./sagas"

const debug = createDebugger("@ha/guest-pin-codes/app")

const app = async (
  doorLocks: string,
  guestCodeOffset: number,
  numberOfGuestCodes: number,
  calendarId: string,
): Promise<{ store: Store; start: () => Promise<void> }> => {
  debug("Started")
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))
  sagaMiddleware.run(sagas)

  debug(
    `Number of guest codes: ${numberOfGuestCodes}, offset by ${guestCodeOffset}`,
  )
  store.dispatch(createGuestSlots(numberOfGuestCodes, guestCodeOffset))
  store.dispatch(addDoorLocks(doorLocks.split(",").filter((lock) => !!lock)))
  store.dispatch(setPinsInPool(candidateCodes()))

  const dbClient = await getClient()
  const guestEvents = dbClient.db("guests").collection("events")
  const events = await guestEvents
    .find<WithId<Document> & CalendarEvent>({ calendarId })
    .toArray()
  const chronologicallySortedEvents = events.sort((a, b) => {
    const aStart = new Date(a.start).getTime()
    const bStart = new Date(b.start).getTime()

    return aStart - bStart
  })

  console.log(chronologicallySortedEvents)

  chronologicallySortedEvents.forEach((calendarEvent) => {
    store.dispatch({
      type: "EVENT/NEW",
      payload: calendarEvent,
    })
  })

  return {
    store,
    start: async () => {
      const fetchEventsJob = new CronJob(
        "*/5 * * * *",
        () => {
          store.dispatch(fetchEvents(calendarId))
        },
        null,
        true,
        process.env.TZ ?? "America/New_York",
      )
      store.dispatch(fetchEvents(calendarId))
      fetchEventsJob.start()
    },
  }
}

export default app
