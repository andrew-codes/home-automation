import { omit } from "lodash"
import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import getClient from "../dbClient"
import { assignedSlot } from "../state/lock.slice"

function* persistLockAssignment(action: ReturnType<typeof assignedSlot>) {
  const dbClient: MongoClient = yield call(getClient)
  const guestEvents = dbClient.db("guests").collection("slots")

  yield (call as unknown as any)(
    [guestEvents, guestEvents.updateOne],
    {
      id: action.payload.slotId,
    },
    {
      $set: omit(action.payload, "slotId"),
    },
    { upsert: true },
  )
}

export default persistLockAssignment
