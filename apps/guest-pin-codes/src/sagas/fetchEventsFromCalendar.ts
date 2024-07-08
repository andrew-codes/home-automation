import createDebugger from "debug"
import { merge } from "lodash"
import { call, put, select } from "redux-saga/effects"
import getClient from "../graphClient"
import {
  CalendarEvent,
  created,
  fetchEvents,
  getEvents,
  removed,
  updated,
} from "../state/event.slice"

const debug = createDebugger(
  "@ha/guest-pin-codes/sagas/fetchEventsFromCalendar",
)

function* fetchEventsFromCalendar(action: ReturnType<typeof fetchEvents>) {
  try {
    const { calendarId } = action.payload
    debug(`Fetching events for calendar ${calendarId}`)
    const client = getClient()
    const eventsApi = client.api(`/users/${calendarId}/events`)
    let { value: calendarEvents }: { value?: any[] } = yield call([
      eventsApi,
      eventsApi.get,
    ])

    const knownEvents: CalendarEvent[] = yield select(getEvents)

    const removedEvents =
      knownEvents?.filter(
        (knownEvent) =>
          !calendarEvents?.some(
            (calendarEvent) =>
              knownEvent.eventId === calendarEvent.id &&
              knownEvent.calendarId === calendarId,
          ),
      ) ?? []
    for (const calendarEvent of removedEvents) {
      yield put(removed(calendarEvent))
    }

    const existingEvents =
      knownEvents?.filter((knownEvent) =>
        calendarEvents?.some(
          (calendarEvent) =>
            knownEvent.eventId === calendarEvent.id &&
            knownEvent.calendarId === calendarId,
        ),
      ) ?? []
    const updatedEvents =
      calendarEvents?.filter((calendarEvent) =>
        existingEvents.some(
          (knownEvent) =>
            knownEvent.calendarId === calendarId &&
            knownEvent.eventId === calendarEvent.id &&
            (knownEvent.title !== calendarEvent.subject ||
              knownEvent.start !== calendarEvent.start.dateTime ||
              knownEvent.end !== calendarEvent.end.dateTime),
        ),
      ) ?? []
    for (const calendarEvent of updatedEvents) {
      yield put(
        updated(
          merge({}, calendarEvent, {
            title: calendarEvent.subject,
            start: calendarEvent.start.dateTime,
            end: calendarEvent.end.dateTime,
          }),
        ),
      )
    }

    const newEvents =
      calendarEvents?.filter(
        (calendarEvent) =>
          !knownEvents.some(
            (knownEvent) =>
              knownEvent.eventId === calendarEvent.id &&
              knownEvent.calendarId === calendarId,
          ),
      ) ?? []
    for (const calendarEvent of newEvents) {
      yield put(
        created({
          calendarId,
          eventId: calendarEvent.id,
          title: calendarEvent.subject,
          start: calendarEvent.start.dateTime,
          end: calendarEvent.end.dateTime,
        }),
      )
    }
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default fetchEventsFromCalendar
