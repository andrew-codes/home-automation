import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import type { SlotAssignAction } from "../actions"
import type { CalendarEvent } from "../reducer"
import { getEvents } from "../selectors"

const debug = createDebugger("@ha/guest-pin-codes/assignEvent")

function* assignEvent(action: SlotAssignAction) {
  try {
    const existingCalendarEvents: CalendarEvent[] = yield select(getEvents)
    const calendarEvent = existingCalendarEvents.find(
      (calendarEvent) =>
        calendarEvent.eventId === action.payload.eventId &&
        calendarEvent.calendarId === action.payload.calendarId,
    )
    if (!calendarEvent) {
      return
    }

    debug(
      `Assigning event ${calendarEvent.title} to slot ${action.payload.slotId} with pin ${calendarEvent.pin}`,
    )
    const mqtt = yield call(createMqtt)
    yield call(
      [mqtt, mqtt.publish],
      `guest/slot/${action.payload.slotId}/set`,
      JSON.stringify({
        title: calendarEvent.title,
        slotId: parseInt(action.payload.slotId, 10),
        pin: calendarEvent.pin,
        start: calendarEvent.start,
        end: calendarEvent.end,
      }),
      { qos: 1 },
    )
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default assignEvent
