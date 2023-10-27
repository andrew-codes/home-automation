import { createMqtt } from "@ha/mqtt-client"
import { merge } from "lodash"
import { call, put, select } from "redux-saga/effects"
import type { EventNewAction, EventRemoveAction } from "../actions"
import type { CalendarEvent, Slot } from "../reducer"
import { getCandidateSlots, getEvents } from "../selectors"

function* assignEvent(action: EventRemoveAction | EventNewAction) {
  try {
    const slots: Slot[] = yield select(getCandidateSlots)

    const slotToAssign = slots[0] ?? null
    if (slotToAssign === null) {
      return
    }

    const existingCalendarEvents: CalendarEvent[] = yield select(getEvents)
    const nextUpcomingExistingCalendarEvent = existingCalendarEvents[0] ?? null
    let calendarEvent = nextUpcomingExistingCalendarEvent
    if (
      action.type === "EVENT/NEW" &&
      new Date(action.payload.start) <
        new Date(nextUpcomingExistingCalendarEvent.start)
    ) {
      calendarEvent = merge({}, action.payload, {
        id: action.payload.eventId,
      })
    }

    if (calendarEvent === null) {
      return
    }

    const mqtt = yield call(createMqtt)
    yield call(
      [mqtt, mqtt.publish],
      `guest/slot/${slotToAssign.id}/set`,
      JSON.stringify({
        title: calendarEvent.title,
        slotId: parseInt(slotToAssign.id),
        pin: calendarEvent.pin,
        start: calendarEvent.start,
        end: calendarEvent.end,
      }),
      { qos: 1 },
    )
    yield put({
      type: "SLOT/ASSIGN",
      payload: {
        calendarId: action.payload.calendarId,
        eventId: action.payload.eventId,
        slotId: slotToAssign.id,
      },
    })
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default assignEvent
