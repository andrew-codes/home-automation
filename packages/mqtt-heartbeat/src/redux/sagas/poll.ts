import { call, put } from "redux-saga/effects"
import { delay } from "@ha/delay"
import { updateHomeAssistant } from "../actionCreators"
import { PollHeartbeatAction } from "../actions.types"

function* poll(action: PollHeartbeatAction) {
  while (true) {
    yield put(updateHomeAssistant(action.payload))
    yield call(delay, 60000)
  }
}

export default poll
