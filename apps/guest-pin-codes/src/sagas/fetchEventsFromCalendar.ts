import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import getNow from "../getNow"
import getClient from "../graphClient"
import { getAssignedEvents } from "../state/assignedEvent.slice"
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

const createEvent = (event, calendarId): CalendarEvent => {
  const startUtc = new Date(`${event.start.dateTime}Z`)
  const start = new Date(
    startUtc.getTime() - startUtc.getTimezoneOffset() * 60 * 1000,
  ).toISOString()
  const endUtc = new Date(`${event.end.dateTime}Z`)
  const end = new Date(
    endUtc.getTime() - endUtc.getTimezoneOffset() * 60 * 1000,
  ).toISOString()
  return {
    title: event.subject,
    id: event.id,
    calendarId,
    start,
    end,
  }
}

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

    calendarEvents = calendarEvents?.map((calendarEvent) =>
      createEvent(calendarEvent, calendarId),
    )
    const knownEvents: CalendarEvent[] = yield select(getEvents)

    const removedEvents =
      knownEvents?.filter(
        (knownEvent) =>
          !calendarEvents?.some(
            (calendarEvent) =>
              knownEvent.id === calendarEvent.id &&
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
            knownEvent.id === calendarEvent.id &&
            knownEvent.calendarId === calendarId,
        ),
      ) ?? []
    const updatedEvents =
      calendarEvents?.filter((calendarEvent) =>
        existingEvents.some(
          (knownEvent) =>
            knownEvent.calendarId === calendarId &&
            knownEvent.id === calendarEvent.id &&
            (knownEvent.title !== calendarEvent.title ||
              knownEvent.start !== calendarEvent.start ||
              knownEvent.end !== calendarEvent.end),
        ),
      ) ?? []
    for (const calendarEvent of updatedEvents) {
      yield put(updated(calendarEvent))
    }

    const assignedEvents = yield select(getAssignedEvents)
    const now = getNow()
    const newEvents =
      calendarEvents
        ?.filter(
          (calendarEvent) =>
            new Date(calendarEvent.end).getTime() >= now.getTime(),
        )
        ?.filter(
          (calendarEvent) =>
            !assignedEvents.some(
              (knownEventId) => knownEventId === calendarEvent.id,
            ),
        ) ?? []
    for (const calendarEvent of newEvents) {
      yield put(created(calendarEvent))
    }
  } catch (error) {
    debug("Error fetching events", error)
  }
}

export default fetchEventsFromCalendar
