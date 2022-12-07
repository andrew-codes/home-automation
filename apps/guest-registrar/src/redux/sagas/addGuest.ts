import { createLogger } from "@ha/logger"
import { call } from "redux-saga/effects"
import {
  MongoClient,
  Db,
  WithId,
  Filter,
  Document,
  UpdateResult,
  UpdateOptions,
} from "mongodb"
import getMongoDbClient from "../../dbClient"
import { AddGuestAction } from "../types"

const logger = createLogger()

function* addGuest(action: AddGuestAction) {
  try {
    logger.info(`Guest MAC to add: ${action.payload}`)
    const dbClient: MongoClient = yield call(getMongoDbClient)
    const db: Db = yield call(dbClient.db, "guests")
    const collection = db.collection("macs")
    yield call<
      (
        filterDoc: Filter<Document>,
        doc: Partial<Document>,
        options: UpdateOptions,
      ) => Promise<UpdateResult>
    >(collection.updateOne, {}, { mac: action.payload.mac }, { upsert: true })
  } catch (error) {
    logger.error(error)
  }
}

export default addGuest
