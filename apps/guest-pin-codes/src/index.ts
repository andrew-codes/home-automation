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

const run = async (
  doorLocks: string,
  codeExclusions: string,
  guestCodeOffset: number,
  numberOfGuestCodes: number
) => {
  debug("Started")
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))

  store.subscribe(() => {
    debug(store.getState())
  })

  debug(
    `Number of guest codes: ${numberOfGuestCodes}, offset by ${guestCodeOffset}`
  )
  store.dispatch(setGuestSlots(numberOfGuestCodes, guestCodeOffset))
  store.dispatch(addDoorLocks(doorLocks.split(",").filter((lock) => !!lock)))

  const exclusionCodes = codeExclusions.split(",")
  const codes = candiateCodes.filter((code) => !exclusionCodes.includes(code))
  store.dispatch(addCodesToPool(shuffle(codes)))

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

if (require.main === module) {
  run(
    DOOR_LOCKS as string,
    GUEST_LOCK_CODE_EXCLUSIONS as string,
    parseInt(GUEST_CODE_INDEX_OFFSET as string, 10) + 1,
    parseInt(NUMBER_OF_GUEST_CODES as string, 10)
  )
}

export default run
