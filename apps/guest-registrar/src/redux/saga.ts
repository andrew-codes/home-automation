import { all, fork, takeLatest } from "redux-saga/effects"
import pollDiscovery from "./sagas/pollDiscovery"
import discoverDevices from "./sagas/discover"
import registerWithHomeAssistant from "./sagas/registerWithHomeAssistant"
import updateHomeAssistant from "./sagas/updateHomeAssistant"

function* discoverDevicesSaga() {
  yield takeLatest("DISCOVER", discoverDevices)
}

function* pollDisoverySaga() {
  yield takeLatest("POLL_DISCOVERY", pollDiscovery)
}

function* registerWithHomeAssistantSaga() {
  yield takeLatest("REGISTER_WITH_HOME_ASSISTANT", registerWithHomeAssistant)
}

function* updateHomeAssistantSaga() {
  yield takeLatest("UPDATE_HOME_ASSISTANT", updateHomeAssistant)
}

function* saga() {
  yield all(
    [
      discoverDevicesSaga,
      pollDisoverySaga,
      registerWithHomeAssistantSaga,
      updateHomeAssistantSaga,
    ].map((saga) => fork(saga))
  )
}

export default saga