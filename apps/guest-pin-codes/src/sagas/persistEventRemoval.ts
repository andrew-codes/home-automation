import type { MongoClient } from "mongodb"
import { call, put } from "redux-saga/effects"
import getClient from "../dbClient"
import { removed } from "../state/event.slice"

function* persistEventRemoval(action: ReturnType<typeof removed>) {
  try {
    const dbClient: MongoClient = yield call(getClient)
    const guestEvents = dbClient.db("guests").collection("events")

    yield (call as unknown as any)([guestEvents, guestEvents.deleteOne], {
      id: `${action.payload.calendarId}:${action.payload.eventId}`,
    })
  } catch (error) {
    yield put({ type: "ERROR", payload: { error: error } })
  }
}

export default persistEventRemoval
