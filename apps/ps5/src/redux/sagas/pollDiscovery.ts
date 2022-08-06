import createDebugger from "debug"
import { delay, put } from "redux-saga/effects"
import { discoverDevices } from "../actionCreators"

const debug = createDebugger("@ha/ps5/pollDevicess")

function* pollDisovery() {
  while (true) {
    try {
      yield put(discoverDevices())
      yield delay(15000)
    } catch (e) {
      debug(e)
    }
  }
}

export { pollDisovery }
