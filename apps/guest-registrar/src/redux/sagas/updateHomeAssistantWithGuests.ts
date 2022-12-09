import { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import { createLogger } from "@ha/logger"
import { call, put } from "redux-saga/effects"
import { MongoClient, Db, WithId, Document, FindCursor } from "mongodb"
import { createMqtt } from "@ha/mqtt-client"
import getMongoDbClient from "../../dbClient"
import { AddGuestAction } from "../types"
import { updateMacs } from "../actionCreators"

const logger = createLogger()

function* updateHomeAssistantWithGuests(action: AddGuestAction) {
  try {
    logger.info("Updating HA with guests")
    const dbClient: MongoClient = yield call(getMongoDbClient)
    const db = dbClient.db("guests")
    const findResults = db.collection("macs").find({})
    const results: WithId<Document>[] = yield (
      call as unknown as (args: any[]) => void
    )([findResults, findResults.toArray])
    logger.info(JSON.stringify(results, null, 2))
    const macs = results.map((r) => r.mac)
    logger.info("Registered guest MACs")
    logger.info(JSON.stringify(macs, null, 2))
    for (const mac in macs) {
      const mqtt: AsyncMqttClient = yield call(createMqtt)
      yield call<
        (
          topic: string,
          message: string | Buffer,
          { qos }: { qos: number },
        ) => Promise<IPublishPacket>
      >(mqtt.publish.bind(mqtt), `"homeassistant/group/guests/add"`, mac, {
        qos: 1,
      })
    }
    yield put(updateMacs(macs))
  } catch (error) {
    logger.error(error)
  }
}

export default updateHomeAssistantWithGuests
