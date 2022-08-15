import { createLogger } from "@ha/logger"
import { delay, put } from "redux-saga/effects"
import { discover } from "../actionCreators"
import type { PollDiscoveryAction } from "../types"

const logger = createLogger()

function* pollDiscovery(action: PollDiscoveryAction) {
  while (true) {
    try {
      logger.info('Discovering devices')
      yield put(discover())
      yield delay(action.payload)
    } catch (e) {
      logger.error(e)
    }
  }
}

export default pollDiscovery
