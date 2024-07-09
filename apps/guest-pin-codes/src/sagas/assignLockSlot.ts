import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, select } from "redux-saga/effects"
import { getAssigned } from "../state/assignedEvent.slice"
import { CalendarEvent, getEvents } from "../state/event.slice"
import { assignedSlot } from "../state/lock.slice"

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

    const assignedEvent = yield select(getAssigned)
    const pin = assignedEvent.find(
      ([eventId, code]) => eventId === action.payload.eventId,
    )?.[1]

    if (!pin) {
      return
    }

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
      { qos: 0 },
    )
  } catch (error) {
    console.log(error)
  }
}

export default assignLockSlot
