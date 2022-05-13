import createDebugger from "debug"
import type { Controller } from "@ha/unifi-client"
import { createUnifi } from "@ha/unifi-client"
import { call } from "redux-saga/effects"
import { DiscoverAction } from "../types"

const debug = createDebugger("@ha/guest-wifi-updater-app/discover")

function* pollDiscovery(action: DiscoverAction) {
  try {
    const unifi: Controller = yield call(createUnifi)
    const wlans = yield call([unifi, unifi.getWLanGroups])
    debug(wlans)
  } catch (e) {
    debug(e)
  }
}

export default pollDiscovery
