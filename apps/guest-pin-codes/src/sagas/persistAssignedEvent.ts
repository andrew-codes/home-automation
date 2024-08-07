import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import getClient from "../dbClient"
import { assigned } from "../state/assignedEvent.slice"

function* persistAssignedEvent({ payload }: ReturnType<typeof assigned>) {
  const dbClient: MongoClient = yield call(getClient)
  const codes = dbClient.db("guests").collection("assignedEvents")
  yield (call as unknown as any)(
    [codes, codes.updateOne],
    {
      id: payload.id,
    },
    {
      $set: payload,
    },
    { upsert: true },
  )
}

export default persistAssignedEvent
