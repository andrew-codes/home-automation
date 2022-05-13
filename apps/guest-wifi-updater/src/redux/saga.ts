import { all, fork, takeLatest } from "redux-saga/effects"
import pollDiscovery from "./sagas/pollDiscovery"
import discoverDevices from "./sagas/discover"

function* discoverDevicesSaga() {
  yield takeLatest("DISCOVER_DEVICES", discoverDevices)
}

function* pollDisoverySaga() {
  yield takeLatest("POLL_DISCOVERY", pollDiscovery)
}

function* saga() {
  yield all([discoverDevicesSaga, pollDisoverySaga].map((saga) => fork(saga)))
}

export default saga
