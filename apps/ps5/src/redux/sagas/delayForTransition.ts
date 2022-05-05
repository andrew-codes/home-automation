import createDebugger from "debug"
import { merge } from "lodash"
import { delay, put } from "redux-saga/effects"
import type { SetTransitioningAction } from "../types"
import { pollDevices, setTransitioning } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/checkDevicesState")

function* delayForTransition(action: SetTransitioningAction) {
  yield delay(15000)

  yield put(
    setTransitioning(merge({}, action.payload, { transitioning: false }))
  )
  yield put(pollDevices())
}

export { delayForTransition }
