import { isEmpty, merge } from "lodash"
import { call, put, select } from "redux-saga/effects"
import { EventFetchAction } from "../actions"
import getClient from "../graphClient"
import { CalendarEvent } from "../reducer"
import { getAvailablePins, getEvents } from "../selectors"

function* fetchEventsFromCalendar(action: EventFetchAction) {
  try {
    const { calendarId } = action.payload
    const client = getClient()
    const eventsApi = client.api(`/users/${calendarId}/events`)
    let { value: calendarEvents }: { value?: any[] } = yield call([
      eventsApi,
      eventsApi.get,
    ])

    calendarEvents =
      calendarEvents?.map((calendarEvent) =>
        merge({}, calendarEvent, {
          start: {
            dateTime: new Date(
              `${calendarEvent.start.dateTime}Z`,
            ).toISOString(),
          },
          end: {
            dateTime: new Date(`${calendarEvent.end.dateTime}Z`).toISOString(),
          },
        }),
      ) ?? []

    const futureOnlyCalendarEvents =
      calendarEvents?.filter((calendarEvent) => {
        return (
          new Date(calendarEvent.start.dateTime).getTime() >
          new Date().getTime()
        )
      }) ?? []

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
      yield put({
        type: "EVENT/REMOVE",
        payload: {
          calendarId,
          eventId: calendarEvent.eventId,
        },
      })
    }

    const existingEvents =
      knownEvents?.filter((knownEvent) =>
        futureOnlyCalendarEvents?.some(
          (calendarEvent) =>
            knownEvent.eventId === calendarEvent.id &&
            knownEvent.calendarId === calendarId,
        ),
      ) ?? []

    const eventsWithUpdatedTitle =
      futureOnlyCalendarEvents?.filter((calendarEvent) =>
        existingEvents.some(
          (knownEvent) =>
            knownEvent.eventId === calendarEvent.id &&
            knownEvent.title !== calendarEvent.subject,
        ),
      ) ?? []
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

    const eventsWithUpdatedTime =
      futureOnlyCalendarEvents?.filter((calendarEvent) =>
        existingEvents.some(
          (knownEvent) =>
            knownEvent.eventId === calendarEvent.id &&
            knownEvent.start !== calendarEvent.start.dateTime &&
            knownEvent.end !== calendarEvent.end.dateTime,
        ),
      ) ?? []
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

    const newEvents =
      futureOnlyCalendarEvents?.filter(
        (calendarEvent) =>
          !knownEvents.some(
            (knownEvent) =>
              knownEvent.eventId === calendarEvent.id &&
              knownEvent.calendarId === calendarId,
          ),
      ) ?? []

    if (isEmpty(newEvents)) {
      return
    }

    const availablePins = yield select(getAvailablePins)
    let index = 0
    for (const calendarEvent of newEvents) {
      yield put({
        type: "EVENT/NEW",
        payload: {
          pin: availablePins[index],
          calendarId,
          eventId: calendarEvent.id,
          title: calendarEvent.subject,
          start: calendarEvent.start.dateTime,
          end: calendarEvent.end.dateTime,
        },
      })
      index += 1
    }
  } catch (error) {
    yield put({ type: "ERROR", payload: { error } })
  }
}

export default fetchEventsFromCalendar
