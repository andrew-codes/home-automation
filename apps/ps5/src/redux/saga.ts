import {
  all,
  call,
  delay,
  fork,
  race,
  take,
  takeLatest,
} from "redux-saga/effects"
import { createLogger } from "@ha/logger"
import { discoverDevices } from "./sagas/discoverDevices"
import { registerWithHomeAssistant } from "./sagas/registerWithHomeAssistant"
import { turnOnDevice } from "./sagas/turnOnDevice"
import { turnOffDevice } from "./sagas/turnOffDevice"
import { updateHomeAssistant } from "./sagas/updateHomeAssistant"
import { pollDevices } from "./sagas/pollDevices"
import { checkDevicesState } from "./sagas/checkDevicesState"
import { pollDisovery } from "./sagas/pollDiscovery"

const logger = createLogger()

function* discoverDevicesSaga() {
  yield takeLatest("DISCOVER_DEVICES", discoverDevices)
}

function* pollDisoverySaga() {
  yield takeLatest("POLL_DISCOVERY", pollDisovery)
}

function* addDevicesSaga() {
  yield takeLatest("REGISTER_DEVICE", registerWithHomeAssistant)
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
  yield takeLatest("POLL_DEVICES", function* pollingRace() {
    while (true) {
      yield race({
        task: call(pollDevices),
        cancel: take("APPLY_TO_DEVICE"),
      })
      logger.info("Temporarily stopping polling, will resume shortly.")
      yield delay(6000)
    }
  })
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
    ].map((saga) => fork(saga)),
  )
}

export default saga
