import { createLogger } from "@ha/logger"
import { delay, put } from "redux-saga/effects"
import { discoverDevices } from "../actionCreators"

const logger = createLogger()

function* pollDisovery() {
  while (true) {
    try {
      logger.info('Discover devices')
      yield put(discoverDevices())
      yield delay(15000)
    } catch (e) {
      logger.error(e)
    }
  }
}

export { pollDisovery }
