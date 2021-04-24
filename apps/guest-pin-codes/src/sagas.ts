import createDebugger from "debug"
import { call, fork, put, select, takeLatest } from "redux-saga/effects"
import { defaultTo } from "lodash"
import { get } from "lodash/fp"
import { calendar_v3, google, Common } from "googleapis"
import {
  ADD_FUTURE_CALENDAR_EVENTS,
  FETCH_NEW_CALENDAR_EVENTS,
} from "./actions"
import { addNewCalendarEvents } from "./actionCreators"
import { getCalendarEvents } from "./selectors"

const debug = createDebugger("@ha/guest-pin-codes/sagas")
const { GOOGLE_CALENDAR_ID, GOOGLE_PRIVATE_KEY } = process.env

function* fetchNewCalendarEvents(action) {
  try {
    debug("Fetching calendar events")
    const creds = JSON.parse(GOOGLE_PRIVATE_KEY as string)
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
      subject: "andrew@andrew.codes",
    })
    const calendar = google.calendar({
      version: "v3",
      auth,
    })
    debug(new Date().toUTCString())
    const { data } = yield call<
      calendar_v3.Calendar,
      (
        params?: calendar_v3.Params$Resource$Events$List,
        options?: Common.MethodOptions
      ) => Common.GaxiosPromise<calendar_v3.Schema$Events>
    >(
      [calendar, calendar.events.list],
      {
        calendarId: GOOGLE_CALENDAR_ID as string,
      },
      {}
    )
    const futureCalendarEvents = data.items?.filter((calendarEvent) => {
      const start = defaultTo(
        calendarEvent.start.dateTime,
        calendarEvent.start.date
      )
      return new Date(start).getTime() >= Date.now()
    })
    debug(futureCalendarEvents.map(get("summary")))
    const calendarEventsToAdd: any[] = []
    for (
      let eventIndex = 0;
      eventIndex < futureCalendarEvents.length;
      eventIndex++
    ) {
      try {
        const calendarEvent = futureCalendarEvents[eventIndex]
        const response = yield call<
          calendar_v3.Calendar,
          (
            params?: calendar_v3.Params$Resource$Events$Get,
            options?: Common.MethodOptions
          ) => Common.GaxiosPromise<calendar_v3.Schema$Event>
        >(
          [calendar, calendar.events.get],
          {
            calendarId: GOOGLE_CALENDAR_ID as string,
            eventId: calendarEvent.id,
          },
          {}
        )
        if (response.data) {
          calendarEventsToAdd.push(response.data)
        }
      } catch (err) {
        debug(err)
      }
    }
    yield put(addNewCalendarEvents(calendarEventsToAdd))
  } catch (error) {
    debug(error)
  }
}

function* updateCalendarEventsWithPin(action) {
  try {
    debug("Updating calendar events with their PINs")
    const creds = JSON.parse(GOOGLE_PRIVATE_KEY as string)
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
      subject: "andrew@andrew.codes",
    })
    const calendar = google.calendar({
      version: "v3",
      auth,
    })
    const allCalendarEvents = yield select(getCalendarEvents)
    debug(JSON.stringify(allCalendarEvents))
    const events = allCalendarEvents.filter((calendarEvent) =>
      action.payload.find(({ id }) => id === calendarEvent.id)
    )
    for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
      try {
        const calendarEvent = events[eventIndex]
        const response = yield call<
          calendar_v3.Calendar,
          (
            params?: calendar_v3.Params$Resource$Events$Update,
            options?: Common.MethodOptions
          ) => Common.GaxiosPromise<calendar_v3.Schema$Events>
        >(
          [calendar, calendar.events.update],
          {
            calendarId: GOOGLE_CALENDAR_ID as string,
            eventId: calendarEvent.id,
            sendUpdates: "all",
            requestBody: {
              ...calendarEvent,
              description: `ACCESS CODE: ${calendarEvent.pin}
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew at andrew@andrew.codes
- call or text Dorri: (706) 957-3270
- call or text Andrew: (470) 535-9093

Thank you!
`,
            },
          },
          {}
        )
        debug(`Updated calendar event: ${response.data.id}`)
      } catch (err) {
        debug(err)
      }
    }
  } catch (error) {
    debug(error)
  }
}

function* updateCalendarEventsWithPinSaga() {
  yield takeLatest(ADD_FUTURE_CALENDAR_EVENTS, updateCalendarEventsWithPin)
}

function* fetchNewCalendarEventsSaga() {
  yield takeLatest(FETCH_NEW_CALENDAR_EVENTS, fetchNewCalendarEvents)
}

function* sagas() {
  yield fork(fetchNewCalendarEventsSaga)
  yield fork(updateCalendarEventsWithPinSaga)
}

export default sagas
