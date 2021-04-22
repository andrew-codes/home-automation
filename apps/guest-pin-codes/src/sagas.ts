import createDebugger from "debug"
const fetch = require("node-fetch")
import qs from "querystring"
import { call, fork, put, takeLatest } from "redux-saga/effects"
import { defaultsTo, merge } from "lodash"
import { FETCH_NEW_CALENDAR_EVENTS } from "./actions"
import jwt from "jsonwebtoken"
import { addNewCalendarEvents } from "./actionCreators"

const debug = createDebugger("@ha/guest-pin-code/sagas")
const {
  GOOGLE_CALENDAR_ID,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SERVICE_ACCOUNT,
} = process.env

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
function getRandomPin(digits) {
  return new Array(digits)
    .fill("")
    .map(() => getRandomInt(9))
    .join("")
}

async function* fetchNewCalendarEvents(action) {
  try {
    debug("Fetching calendar events")
    const accessTokenRequestJwt = jwt.sign(
      {
        iss: GOOGLE_SERVICE_ACCOUNT,
        scope: "https://www.googleapis.com/auth/calendar.events",
        aud: "https://oauth2.googleapis.com/token",
      },
      GOOGLE_PRIVATE_KEY,
      { algorithm: "RS256" }
    )
    debug("JWT request token", accessTokenRequestJwt)
    const accessTokenRequestBody = qs.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: accessTokenRequestJwt,
    })
    const accessTokenResponse = yield call(fetch, [
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        body: accessTokenRequestBody,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    ])
    const { accessToken, expiresIn } = await accessTokenResponse.json()
    debug(`Token expires in ${expiresIn}`)

    const listCalendarEventsRequest = yield call(fetch, [
      `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ])
    const { items } = await listCalendarEventsRequest.json()

    const nowTimeStamp = Date.now()
    const futureCalendarEventsWithPin = items
      .filter((calendarEvent) => {
        const startDateTime = new Date(
          defaultsTo(
            calendarEvent.start.startDateTime,
            calendarEvent.start.date
          )
        )
        return nowTimeStamp < startDateTime.getMilliseconds()
      })
      .map((calendarEvent) => {
        const pin = `${getRandomPin(4)}`
        return merge({}, calendarEvent, { pin })
      })
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
