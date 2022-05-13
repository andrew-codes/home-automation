import { all, fork, takeLatest } from "redux-saga/effects"
import pollDiscovery from "./sagas/pollDiscovery"
import discoverDevices from "./sagas/discover"
import registerWithHomeAssistant from "./sagas/registerWithHomeAssistant"
import updateHomeAssistant from "./sagas/updateHomeAssistant"
import setGuestWifiPassPhrase from "./sagas/setGuestWifiPassPhrase"

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

function* setGuestWifiPassPhraseSaga() {
  yield takeLatest("SET_GUEST_WIFI_PASS_PHRASE", setGuestWifiPassPhrase)
}

function* saga() {
  yield all(
    [
      discoverDevicesSaga,
      pollDisoverySaga,
      registerWithHomeAssistantSaga,
      setGuestWifiPassPhraseSaga,
      updateHomeAssistantSaga,
    ].map((saga) => fork(saga))
  )
}

export default saga
