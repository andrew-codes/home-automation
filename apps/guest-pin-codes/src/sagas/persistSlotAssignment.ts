import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import { SlotAssignAction } from "../actions"
import getClient from "../dbClient"

function* persistSlotAssignment(action: SlotAssignAction) {
  const dbClient: MongoClient = yield call(getClient)
  const guestEvents = dbClient.db("guests").collection("slots")

  yield (call as unknown as any)(
    [guestEvents, guestEvents.updateOne],
    {
      id: action.payload.slotId,
    },
    {
      $set: action.payload,
    },
    { upsert: true },
  )
}

export default persistSlotAssignment
