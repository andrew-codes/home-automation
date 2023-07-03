import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { createStore, applyMiddleware, Store } from "redux"
import { CronJob } from "cron"
import candidateCodes from "./candidateCodes"
import reducer from "./reducer"
import sagas from "./sagas"
import {
  setPinsInPool,
  addDoorLocks,
  fetchEvents,
  createGuestSlots,
} from "./actionCreators"

const debug = createDebugger("@ha/guest-pin-codes/app")

const app = async (
  doorLocks: string,
  guestCodeOffset: number,
  numberOfGuestCodes: number,
): Promise<{ store: Store; start: () => Promise<void> }> => {
  debug("Started")
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))

  store.subscribe(() => {
    debug(store.getState())
  })

  debug(
    `Number of guest codes: ${numberOfGuestCodes}, offset by ${guestCodeOffset}`,
  )
  store.dispatch(createGuestSlots(numberOfGuestCodes, guestCodeOffset))
  store.dispatch(addDoorLocks(doorLocks.split(",").filter((lock) => !!lock)))

  store.dispatch(setPinsInPool(candidateCodes()))

  sagaMiddleware.run(sagas)

  return {
    store,
    start: async () => {
      const fetchEventsJob = new CronJob(
        "*/5 * * * *",
        () => {
          store.dispatch(fetchEvents())
        },
        null,
        true,
        process.env.TZ ?? "America/New_York",
      )
      store.dispatch(fetchEvents())
      fetchEventsJob.start()
    },
  }
}

export default app
