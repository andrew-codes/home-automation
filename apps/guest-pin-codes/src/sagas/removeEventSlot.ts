import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import type { EventRemoveAction } from "../actions"
import type { CalendarEvent } from "../reducer"
import { getEvents } from "../selectors"

const debug = createDebugger("@ha/guest-pin-codes/sagas/removeEventSlot")

function* removeEventSlot(action: EventRemoveAction) {
  try {
    const existingCalendarEvents: CalendarEvent[] = yield select(getEvents)
    const calendarEvent = existingCalendarEvents.find(
      (calendarEvent) =>
        calendarEvent.eventId === action.payload.eventId &&
        calendarEvent.calendarId === action.payload.calendarId,
    )

    debug(
      `Removing event from slot for ${JSON.stringify(calendarEvent, null, 2)}`,
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
        pin: "",
      }),
      { qos: 1 },
    )
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default removeEventSlot
