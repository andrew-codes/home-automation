import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import { CalendarEvent, getEvents } from "../state/event.slice"
import { assignedSlot } from "../state/lock.slice"
import { getPins } from "../state/pinCode.slice"

const debug = createDebugger("@ha/guest-pin-codes/assignLockSlot")

function* assignLockSlot(action: ReturnType<typeof assignedSlot>) {
  try {
    const calendarEvents: CalendarEvent[] = yield select(getEvents)
    const calendarEvent = calendarEvents.find(
      (calendarEvent) =>
        calendarEvent.id === action.payload.eventId &&
        calendarEvent.calendarId === action.payload.calendarId,
    )
    if (!calendarEvent) {
      return
    }

    const eventCode = yield select(getPins)
    const pin = eventCode.find((pin) => pin.eventId === action.payload.eventId)

    debug(
      `Assigning event ${calendarEvent.title} to slot ${action.payload.slotId} with pin ${pin}`,
    )
    const mqtt = yield call(createMqtt)
    yield call(
      [mqtt, mqtt.publish],
      `guest/slot/${action.payload.slotId}/set`,
      JSON.stringify({
        title: calendarEvent.title,
        slotId: parseInt(action.payload.slotId, 10),
        pin,
        start: calendarEvent.start,
        end: calendarEvent.end,
      }),
      { qos: 1 },
    )
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default assignLockSlot
