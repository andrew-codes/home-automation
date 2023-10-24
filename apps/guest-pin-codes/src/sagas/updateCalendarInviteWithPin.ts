import * as React from "react"
import { renderToString } from "react-dom/server"
import { call, put, select } from "redux-saga/effects"
import { EventNewAction } from "../actions"
import getClient from "../graphClient"
import type { CalendarEvent } from "../reducer"
import { getEvents, getGuestWifiNetwork } from "../selectors"

function* updateCalendarEventWithPin(action: EventNewAction) {
  try {
    const { calendarId, eventId } = action.payload
    const client = getClient()
    const eventApi = client.api(`/users/${calendarId}/events/${eventId}`)
    const { default: CalendarInviteBody } = require("./CalendarInviteBody")

    const calendarEvents: CalendarEvent[] = yield select(getEvents)
    const calendarEvent = calendarEvents.find(
      (calendarEvent) =>
        calendarEvent.calendarId === calendarId && calendarEvent.id === eventId,
    )

    if (!calendarEvent) {
      throw new Error(`Calendar event not found: ${calendarId}/${eventId}`)
    }

    const guestWifi = yield select(getGuestWifiNetwork)
    yield call([eventApi, eventApi.patch], {
      body: {
        contentType: "html",
        content: renderToString(
          React.createElement(CalendarInviteBody, {
            pin: calendarEvent.pin,
            guestWifiSsid: guestWifi?.ssid,
            guestWifiPassPhrase: guestWifi?.passPhrase,
          }),
        ),
      },
    })
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default updateCalendarEventWithPin
