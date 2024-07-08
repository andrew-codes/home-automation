import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import getClient from "../dbClient"
import { unassignedSlot } from "../state/lock.slice"

function* persistLockAssignmentRemoval(
  action: ReturnType<typeof unassignedSlot>,
) {
  const dbClient: MongoClient = yield call(getClient)
  const slots = dbClient.db("guests").collection("slots")

  yield (call as unknown as any)([slots, slots.deleteOne], {
    eventId: action.payload.eventId,
    calendarId: action.payload.calendarId,
  })
}

export default persistLockAssignmentRemoval
