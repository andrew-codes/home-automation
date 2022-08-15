import { createLogger } from "@ha/logger"
import { merge } from "lodash"
import { delay, put } from "redux-saga/effects"
import type { SetTransitioningAction } from "../types"
import { pollDevices, setTransitioning } from "../actionCreators"

const logger = createLogger()

function* delayForTransition(action: SetTransitioningAction) {
  logger.info('Stop polling for transition')
  yield delay(15000)

  logger.info("Resume polling")
  yield put(
    setTransitioning(merge({}, action.payload, { transitioning: false }))
  )
  yield put(pollDevices())
}

export { delayForTransition }
