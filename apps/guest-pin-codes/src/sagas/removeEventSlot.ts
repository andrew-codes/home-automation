import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put } from "redux-saga/effects"
import type { EventRemoveAction } from "../actions"

const debug = createDebugger("@ha/guest-pin-codes/sagas/removeEventSlot")

function* removeEventSlot(action: EventRemoveAction) {
  try {
    debug(
      `Removing event from slot for ${JSON.stringify(action.payload, null, 2)}`,
    )
    if (!action.payload.slotId) {
      return
    }

    const mqtt = yield call(createMqtt)
    yield call(
      [mqtt, mqtt.publish],
      `guest/slot/${action.payload.slotId}/set`,
      JSON.stringify({
        slotId: parseInt(action.payload.slotId, 10),
        pin: null,
      }),
      { qos: 1 },
    )
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default removeEventSlot
