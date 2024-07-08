import * as React from "react"
import { renderToString } from "react-dom/server"
import { call, put, select } from "redux-saga/effects"
import getClient from "../graphClient"
import { assigned } from "../state/assignedEvent.slice"
import { getWifi } from "../state/wifi.slice"

function* updateCalendarEventWithPin(action: ReturnType<typeof assigned>) {
  try {
    const { calendarId, id, code } = action.payload
    const client = getClient()
    const eventApi = client.api(`/users/${calendarId}/events/${id}`)

    const guestWifi = yield select(getWifi)
    const { default: CalendarInviteBody } = require("../CalendarInviteBody")
    yield call([eventApi, eventApi.patch], {
      body: {
        contentType: "html",
        content: renderToString(
          React.createElement(CalendarInviteBody, {
            pin: code,
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
