import createDebugger from "debug"
import { put, select } from "redux-saga/effects"
import sh from "shelljs"
import type { Device } from "../types"
import { getDevices, getStateMappings } from "../selectors"
import { updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/checkDevicesState")

function* checkDevicesState() {
  const devices: Device[] = yield select(getDevices)
  for (const device of devices) {
    const shellOutput = sh.exec(`playactor check --host-name ${device.name}`)
    try {
      const updatedDevice = JSON.parse(shellOutput)
      if (updatedDevice.status === device.status) {
        continue
      }
      const stateMappings = yield select(getStateMappings)
      yield put(
        updateHomeAssistant(device, stateMappings[updatedDevice.status])
      )
    } catch (e) {
      debug(e)
    }
  }
}

export { checkDevicesState }
