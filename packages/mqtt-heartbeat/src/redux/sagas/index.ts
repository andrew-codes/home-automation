import { all, fork, takeEvery } from "redux-saga/effects"
import registerWithHomeAssistant from "./registerWithHomeAssistant"
import poll from "./poll"
import updateHomeAssistant from "./updateHomeAssistant"

function* updateHomeAssistantSaga() {
  yield takeEvery("HEARTBEAT/UPDATE_HOME_ASSISTANT", updateHomeAssistant)
}
function* pollSaga() {
  yield takeEvery("HEARTBEAT/POLL", poll)
}

function* registerWithHomeAssistantSaga() {
  yield takeEvery("HEARTBEAT/REGISTER_DEVICE", registerWithHomeAssistant)
}

function* rootSaga() {
  yield all(
    [updateHomeAssistantSaga, pollSaga, registerWithHomeAssistantSaga].map(
      (saga) => fork(saga),
    ),
  )
}

export default rootSaga
