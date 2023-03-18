import { createLogger } from "@ha/logger"
import { call, put } from "redux-saga/effects"
import { Collection, MongoClient, UpdateResult } from "mongodb"
import getMongoDbClient from "../../dbClient"
import { AddGuestAction } from "../types"
import { updateMacs } from "../actionCreators"

const logger = createLogger()

function* addGuest(action: AddGuestAction) {
  try {
    logger.info(`Guest MAC to add: ${action.payload.mac}`)
    const dbClient: MongoClient = yield call(getMongoDbClient)
    const db = dbClient.db("guests")
    logger.debug("Guest db")
    const collection = db.collection("macs")
    logger.debug("macs collection")
    const response: UpdateResult = yield (
      call as unknown as (...args: any) => void
    )(
      [collection, collection.updateOne],
      { id: action.payload.mac },
      { $set: { id: action.payload.mac, mac: action.payload.mac } },
      { upsert: true },
    )
    logger.debug(`DB Response: ${JSON.stringify(response, null, 2)}`)
    yield put(updateMacs([action.payload.mac]))
  } catch (error) {
    logger.error(error)
  }
}

export default addGuest
