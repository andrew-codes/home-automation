import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import getClient from "../dbClient"
import { created, updated } from "../state/event.slice"

function* persistEvent({
  type,
  payload,
}: ReturnType<typeof created> | ReturnType<typeof updated>) {
  const dbClient: MongoClient = yield call(getClient)
  const guestEvents = dbClient.db("guests").collection("events")

  yield (call as unknown as any)(
    [guestEvents, guestEvents.updateOne],
    {
      id: payload.id,
    },
    {
      $set: payload,
    },
    { upsert: true },
  )
}

export default persistEvent
