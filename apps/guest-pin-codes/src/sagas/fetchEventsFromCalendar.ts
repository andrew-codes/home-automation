import { call, put, select } from "redux-saga/effects"
import { EventFetchAction } from "../actions"
import getClient from "../graphClient"
import { CalendarEvent } from "../reducer"
import { getEvents, getNextPin } from "../selectors"

function* fetchEventsFromCalendar(action: EventFetchAction) {
  try {
    const { calendarId } = action.payload
    const client = getClient()
    const eventsApi = client.api(`/users/${calendarId}/events`)
    const { value: calendarEvents } = yield call([eventsApi, eventsApi.get])

    const knownEvents: CalendarEvent[] = yield select(getEvents)

    const eventsWithUpdatedTitle = calendarEvents.filter((calendarEvent) =>
      knownEvents.some(
        (knownEvent) =>
          knownEvent.id === calendarEvent.id &&
          knownEvent.title !== calendarEvent.subject,
      ),
    )
    const eventsWithUpdatedTime = calendarEvents.filter((calendarEvent) =>
      knownEvents.some(
        (knownEvent) =>
          knownEvent.id === calendarEvent.id &&
          knownEvent.start !== calendarEvent.start.dateTime &&
          knownEvent.end !== calendarEvent.end.dateTime,
      ),
    )
    const newEvents = calendarEvents.filter(
      (calendarEvent) =>
        !knownEvents.some((knownEvent) => knownEvent.id === calendarEvent.id),
    )

    for (const calendarEvent of eventsWithUpdatedTitle) {
      yield put({
        type: "EVENT/TITLE_CHANGE",
        payload: {
          calendarId,
          eventId: calendarEvent.id,
          title: calendarEvent.subject,
        },
      })
    }
    for (const calendarEvent of eventsWithUpdatedTime) {
      yield put({
        type: "EVENT/TIME_CHANGE",
        payload: {
          calendarId,
          eventId: calendarEvent.id,
          start: calendarEvent.start.dateTime,
          end: calendarEvent.end.dateTime,
        },
      })
    }
    for (const calendarEvent of newEvents) {
      const pin = yield select(getNextPin)
      yield put({
        type: "EVENT/NEW",
        payload: {
          pin: pin,
          calendarId,
          eventId: calendarEvent.id,
          title: calendarEvent.subject,
          start: calendarEvent.start.dateTime,
          end: calendarEvent.end.dateTime,
        },
      })
    }
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default fetchEventsFromCalendar
