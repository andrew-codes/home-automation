import { all, fork, takeLatest } from "redux-saga/effects"
import { discoverDevices } from "./sagas/discoverDevices"
import { addDeviceToHomeAssistant } from "./sagas/addDeviceToHomeAssistant"
import { turnOnDevice } from "./sagas/turnOnDevice"
import { turnOffDevice } from "./sagas/turnOffDevice"
import { updateHomeAssistant } from "./sagas/updateHomeAssistant"
import { pollDevices } from "./sagas/pollDevices"
import { checkDevicesState } from "./sagas/checkDevicesState"
import { pollDisovery } from "./sagas/pollDiscovery"

function* discoverDevicesSaga() {
  yield takeLatest("DISCOVER_DEVICES", discoverDevices)
}

function* pollDisoverySaga() {
  yield takeLatest("POLL_DISCOVERY", pollDisovery)
}

function* addDevicesSaga() {
  yield takeLatest("ADD_DEVICE", addDeviceToHomeAssistant)
}

function* turnOnSaga() {
  yield takeLatest("APPLY_TO_DEVICE", turnOnDevice)
}

function* turnOffSaga() {
  yield takeLatest("APPLY_TO_DEVICE", turnOffDevice)
}

function* updateHomeAssistantSaga() {
  yield takeLatest("UPDATE_HOME_ASSISTANT", updateHomeAssistant)
}

function* checkDevicesStateSaga() {
  yield takeLatest("CHECK_DEVICES_STATE", checkDevicesState)
}

function* pollPs5StatesSaga() {
  yield takeLatest("POLL_DEVICES", pollDevices)
}

function* saga() {
  yield all(
    [
      discoverDevicesSaga,
      addDevicesSaga,
      turnOnSaga,
      turnOffSaga,
      updateHomeAssistantSaga,
      checkDevicesStateSaga,
      pollPs5StatesSaga,
      pollDisoverySaga,
    ].map((saga) => fork(saga))
  )
}

export default saga
