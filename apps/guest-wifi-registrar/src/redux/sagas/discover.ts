import { createLogger } from "@ha/logger"
import type { Controller } from "@ha/unifi-client"
import { createUnifi } from "@ha/unifi-client"
import { call, put } from "redux-saga/effects"
import { DiscoverAction } from "../types"
import {
  registerWithHomeAssistant,
  updateHomeAssistant,
} from "../actionCreators"

const logger = createLogger()

function* pollDiscovery(action: DiscoverAction) {
  try {
    const unifi: Controller = yield call(createUnifi)
    const wlans: any[] = yield call([unifi, unifi.getWLanSettings])
    const guestNetworks: any[] = wlans.filter(
      (wlan) => !!wlan.enabled && !!wlan.is_guest,
    )
    logger.info("Found guest networks")
    logger.info(JSON.stringify(guestNetworks))
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
