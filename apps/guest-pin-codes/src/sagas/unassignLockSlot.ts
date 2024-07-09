import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call } from "redux-saga/effects"
import { unassignedSlot } from "../state/lock.slice"

const debug = createDebugger("@ha/guest-pin-codes/sagas/removeLockAssignment")

function* unassignLockSlot(action: ReturnType<typeof unassignedSlot>) {
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
      { qos: 0 },
    )
  } catch (error) {
    console.log(error)
  }
}

export default unassignLockSlot
