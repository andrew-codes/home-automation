import { logger } from "@ha/logger"
import type { Controller } from "@ha/unifi-client"
import { createUnifi } from "@ha/unifi-client"
import { call, put } from "redux-saga/effects"
import { updateHomeAssistant, updatePorters } from "../actionCreators"
import { SetGuestWifiPassPhraseAction } from "../types"

function* setWifiGuestPassPhrase(action: SetGuestWifiPassPhraseAction) {
  try {
    logger.info(action.payload)
    const unifi: Controller = yield call(createUnifi)
    const result = yield call(
      [unifi, unifi.setWLanSettings],
      action.payload.network.id,
      action.payload.passPhrase,
    )

    yield put(
      updateHomeAssistant(
        action.payload.network.name,
        action.payload.passPhrase,
      ),
    )
    yield put(
      updatePorters(action.payload.network.name, action.payload.passPhrase),
    )
  } catch (e) {
    logger.error(e)
  }
}

export default setWifiGuestPassPhrase
