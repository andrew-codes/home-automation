import { merge } from "lodash"
import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import {
  EventNewAction,
  EventTimeChangeAction,
  EventTitleChangeAction,
} from "../actions"
import getClient from "../dbClient"

function* persistEvent(
  action: EventNewAction | EventTitleChangeAction | EventTimeChangeAction,
) {
  const dbClient: MongoClient = yield call(getClient)
  const guestEvents = dbClient.db("guests").collection("events")

  yield (call as unknown as any)(
    [guestEvents, guestEvents.updateOne],
    {
      id: `${action.payload.calendarId}:${action.payload.eventId}`,
    },
    {
      $set: merge({}, action.payload, {
        id: `${action.payload.calendarId}:${action.payload.eventId}`,
      }),
    },
    { upsert: true },
  )
}

export default persistEvent
