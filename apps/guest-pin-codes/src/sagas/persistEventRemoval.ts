import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import { EventRemoveAction } from "../actions"
import getClient from "../dbClient"

function* persistEventRemoval(action: EventRemoveAction) {
  const dbClient: MongoClient = yield call(getClient)
  const guestEvents = dbClient.db("guests").collection("events")

  yield (call as unknown as any)([guestEvents, guestEvents.deleteOne], {
    id: `${action.payload.calendarId}:${action.payload.eventId}`,
  })
}

export default persistEventRemoval
