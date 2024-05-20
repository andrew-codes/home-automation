import type { MongoClient } from "mongodb"
import { call, put } from "redux-saga/effects"
import { EventRemoveAction } from "../actions"
import getClient from "../dbClient"

function* persistEventRemoval(action: EventRemoveAction) {
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
