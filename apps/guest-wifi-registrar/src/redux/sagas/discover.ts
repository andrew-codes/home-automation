import { logger } from "@ha/logger"
import type { Controller } from "@ha/unifi-client"
import { createUnifi } from "@ha/unifi-client"
import { call, put } from "redux-saga/effects"
import {
  registerWithHomeAssistant,
  updateHomeAssistant,
} from "../actionCreators"
import { DiscoverAction } from "../types"

function* pollDiscovery(action: DiscoverAction) {
  try {
    const unifi: Controller = yield call(createUnifi)
    const wlans: any[] = yield call([unifi, unifi.getWLanSettings])
    const guestNetworks: any[] = wlans.filter(
      (wlan) => !!wlan.enabled && !!wlan.is_guest,
    )
    logger.info("Found guest networks")
    for (let wlan of guestNetworks) {
      yield put(
        registerWithHomeAssistant(wlan._id, wlan.name, wlan.x_passphrase),
      )
      yield put(updateHomeAssistant(wlan.name, wlan.x_passphrase))
    }
  } catch (e) {
    logger.error(e)
  }
}

export default pollDiscovery
