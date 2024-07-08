import type { MongoClient } from "mongodb"
import { call } from "redux-saga/effects"
import getClient from "../dbClient"
import { unassigned } from "../state/assignedEvent.slice"

function* persistAssignedEventRemoval(action: ReturnType<typeof unassigned>) {
  const dbClient: MongoClient = yield call(getClient)
  const codes = dbClient.db("guests").collection("assignedEvents")

  yield (call as unknown as any)([codes, codes.deleteOne], {
    id: action.payload.id,
  })
}

export default persistAssignedEventRemoval
