import * as React from "react"
import { renderToString } from "react-dom/server"
import { call, put, select } from "redux-saga/effects"
import { EventNewAction } from "../actions"
import getClient from "../graphClient"
import { getGuestWifiNetwork } from "../selectors"

function* updateCalendarEventWithPin(action: EventNewAction) {
  try {
    const { calendarId, eventId, pin } = action.payload
    const client = getClient()
    const eventApi = client.api(`/users/${calendarId}/events/${eventId}`)

    const guestWifi = yield select(getGuestWifiNetwork)
    const { default: CalendarInviteBody } = require("../CalendarInviteBody")
    yield call([eventApi, eventApi.patch], {
      body: {
        contentType: "html",
        content: renderToString(
          React.createElement(CalendarInviteBody, {
            pin,
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
