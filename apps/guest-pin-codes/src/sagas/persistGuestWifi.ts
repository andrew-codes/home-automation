import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import { SetGuestWifiNetworkInformationAction } from "../actions"
import getClient from "../dbClient"

function* persistGuestWifi(action: SetGuestWifiNetworkInformationAction) {
  const dbClient: MongoClient = yield call(getClient)
  const guestEvents = dbClient.db("guests").collection("wifi")

  yield (call as unknown as any)(
    [guestEvents, guestEvents.updateOne],
    {
      id: action.payload.ssid,
    },
    {
      $set: action.payload,
    },
    { upsert: true },
  )
}

export default persistGuestWifi
