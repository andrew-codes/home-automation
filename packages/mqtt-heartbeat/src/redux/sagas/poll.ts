import { call, put } from "redux-saga/effects"
import { delay } from "@ha/side-effects"
import { updateHomeAssistant } from "../actionCreators"
import { PollHeartbeatAction } from "../actions.types"

function* poll(action: PollHeartbeatAction) {
  while (true) {
    yield call(delay, 1000)
    yield put(updateHomeAssistant(action.payload))
    yield call(delay, 59000)
  }
}

export default poll
