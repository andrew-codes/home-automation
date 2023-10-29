import { createMqtt } from "@ha/mqtt-client"
import { call, put, select } from "redux-saga/effects"
import type { EventRemoveAction } from "../actions"
import type { CalendarEvent } from "../reducer"
import { getEvents } from "../selectors"

function* assignEvent(action: EventRemoveAction) {
  try {
    const existingCalendarEvents: CalendarEvent[] = yield select(getEvents)
    const calendarEvent = existingCalendarEvents.find(
      (calendarEvent) =>
        calendarEvent.eventId === action.payload.eventId &&
        calendarEvent.calendarId === action.payload.calendarId,
    )
    if (!calendarEvent || !calendarEvent.slotId) {
      return
    }

    const mqtt = yield call(createMqtt)
    yield call(
      [mqtt, mqtt.publish],
      `guest/slot/${calendarEvent.slotId}/set`,
      JSON.stringify({
        slotId: parseInt(calendarEvent.slotId, 10),
        pin: null,
      }),
      { qos: 1 },
    )
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default assignEvent
