import createDebugger from "debug"
import type { Controller } from "@ha/unifi-client"
import { createUnifi } from "@ha/unifi-client"
import { call } from "redux-saga/effects"
import { SetGuestWifiPassPhraseAction } from "../types"

const debug = createDebugger("@ha/guest-registrar/discover")

function* setWifiGuestPassPhrase(action: SetGuestWifiPassPhraseAction) {
  try {
    const unifi: Controller = yield call(createUnifi)
    const result = yield call(
      [unifi, unifi.setWLanSettings],
      action.payload.id,
      action.payload.passPhrase
    )
    debug(result)
  } catch (e) {
    debug(e)
  }
}

export default setWifiGuestPassPhrase
