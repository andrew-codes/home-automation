import { createLogger } from "@ha/logger"
import type { Controller } from "@ha/unifi-client"
import { createUnifi } from "@ha/unifi-client"
import { call, put } from "redux-saga/effects"
import { updatePorters } from "../actionCreators"
import { SetGuestWifiPassPhraseAction } from "../types"

const logger = createLogger()

function* setWifiGuestPassPhrase(action: SetGuestWifiPassPhraseAction) {
  try {
    logger.info(action.payload)
    logger.info(action.payload)
    const unifi: Controller = yield call(createUnifi)
    const result = yield call(
      [unifi, unifi.setWLanSettings],
      action.payload.network.id,
      action.payload.passPhrase,
    )
    logger.info(result)
    logger.info(result)
  } catch (e) {
    logger.error(e)
  }
}

export default setWifiGuestPassPhrase
