import createDebugger from "debug"
import { delay, put } from "redux-saga/effects"
import { checkDevicesState } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/pollDevicess")

function* pollDevices() {
  while (true) {
    try {
      yield put(checkDevicesState())
      yield delay(1000)
    } catch (e) {
      debug(e)
    }
  }
}

export { pollDevices }
