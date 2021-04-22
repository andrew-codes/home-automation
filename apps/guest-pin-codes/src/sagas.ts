import createDebugger from "debug"
import { call, fork, put, takeLatest } from "redux-saga/effects"
import { defaultTo, merge } from "lodash"
import { get } from "lodash/fp"
import { calendar_v3, google, Common } from "googleapis"
import { FETCH_NEW_CALENDAR_EVENTS } from "./actions"
import { addNewCalendarEvents } from "./actionCreators"

const debug = createDebugger("@ha/guest-pin-codes/sagas")
const { GOOGLE_CALENDAR_ID, GOOGLE_PRIVATE_KEY } = process.env

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
function getRandomPin(digits) {
  return new Array(digits)
    .fill("")
    .map(() => getRandomInt(9))
    .join("")
}

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
    const futureCalendarEventsWithPin = data.items
      ?.filter((calendarEvent) => {
        const start = defaultTo(
          calendarEvent.start.dateTime,
          calendarEvent.start.date
        )
        return new Date(start).getTime() >= Date.now()
      })
      .map((calendarEvent) => {
        const pin = `${getRandomPin(4)}`
        return merge({}, calendarEvent, { pin })
      })
    debug(futureCalendarEventsWithPin.map(get("summary")))
    yield put(addNewCalendarEvents(futureCalendarEventsWithPin))
  } catch (error) {
    debug(error)
  }
}

function* fetchNewCalendarEventsSaga() {
  yield takeLatest(FETCH_NEW_CALENDAR_EVENTS, fetchNewCalendarEvents)
}

function* sagas() {
  yield fork(fetchNewCalendarEventsSaga)
}

export default sagas
