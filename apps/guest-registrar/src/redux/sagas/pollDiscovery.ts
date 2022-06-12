import createDebugger from "debug"
import { delay, put } from "redux-saga/effects"
import { discover } from "../actionCreators"
import type { PollDiscoveryAction } from "../types"

const debug = createDebugger("@ha/guest-registrar/pollDiscovery")

function* pollDiscovery(action: PollDiscoveryAction) {
  while (true) {
    try {
      yield put(discover())
      yield delay(action.payload)
    } catch (e) {
      debug(e)
    }
  }
}

export default pollDiscovery
