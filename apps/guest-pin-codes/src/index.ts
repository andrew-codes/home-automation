import createDebugger from "debug"
import createSagaMiddleware from "redux-saga"
import { createHeartbeat } from "@ha/http-heartbeat"
import { createStore, applyMiddleware } from "redux"
import { CronJob } from "cron"
import candidateCodes from "./candidateCodes"
import reducer from "./reducer"
import sagas from "./sagas"
import {
  setCodesInPool,
  addDoorLocks,
  fetchEvents,
  setGuestSlots,
} from "./actionCreators"

const {
  GUEST_PIN_CODES_DOOR_LOCKS,
  GUEST_PIN_CODES_GUEST_CODE_INDEX_OFFSET,
  GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES,
} = process.env
const debug = createDebugger("@ha/guest-pin-codes/index")

const run = async (
  doorLocks: string,
  guestCodeOffset: number,
  numberOfGuestCodes: number,
) => {
  debug("Started")
  await createHeartbeat()
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))

  store.subscribe(() => {
    debug(store.getState())
  })

  debug(
    `Number of guest codes: ${numberOfGuestCodes}, offset by ${guestCodeOffset}`,
  )
  store.dispatch(setGuestSlots(numberOfGuestCodes, guestCodeOffset))
  store.dispatch(addDoorLocks(doorLocks.split(",").filter((lock) => !!lock)))

  store.dispatch(setCodesInPool(candidateCodes()))

  sagaMiddleware.run(sagas)

  const fetchEventsJob = new CronJob(
    "*/5 * * * *",
    () => {
      store.dispatch(fetchEvents(new Date(), 90))
    },
    null,
    true,
    "America/New_York",
  )
  store.dispatch(fetchEvents(new Date(), 90))
  fetchEventsJob.start()
}

if (require.main === module) {
  run(
    GUEST_PIN_CODES_DOOR_LOCKS as string,
    parseInt(GUEST_PIN_CODES_GUEST_CODE_INDEX_OFFSET as string, 10) + 1,
    parseInt(GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES as string, 10),
  )
}

export default run
