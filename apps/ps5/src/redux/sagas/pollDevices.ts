import { createLogger } from "@ha/logger"
import { delay, put } from "redux-saga/effects"
import { checkDevicesState } from "../actionCreators"

const logger = createLogger()
function* pollDevices() {
  logger.info("Polling devices")
  while (true) {
    try {
      yield put(checkDevicesState())
      yield delay(1000)
    } catch (e) {
      logger.error(e)
    }
  }
}

export { pollDevices }
