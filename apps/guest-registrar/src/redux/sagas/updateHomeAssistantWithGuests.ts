import { AsyncMqttClient } from "@ha/mqtt-client"
import { createLogger } from "@ha/logger"
import { call, put } from "redux-saga/effects"
import { MongoClient, WithId, Document } from "mongodb"
import { createMqtt } from "@ha/mqtt-client"
import getMongoDbClient from "../../dbClient"
import { AddGuestAction } from "../types"
import { updateMacs } from "../actionCreators"
import { QoS } from "async-mqtt"

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
    logger.debug(`Results: ${JSON.stringify(results, null, 2)}`)
    const macs = results.map((r) => r.mac)
    logger.debug(`Macs: ${JSON.stringify(macs, null, 2)}`)
    const mqtt: AsyncMqttClient = yield call(createMqtt)
    for (const mac of macs) {
      logger.info(`Registering ${mac} with HA`)
      yield call<
        (
          topic: string,
          message: string | Buffer,
          { qos }: { qos: QoS },
        ) => Promise<void>
      >(mqtt.publish.bind(mqtt), "homeassistant/group/guests/update", mac, {
        qos: 1,
      })
    }
    yield put(updateMacs(macs))
  } catch (error) {
    logger.error(error)
  }
}

export default updateHomeAssistantWithGuests
