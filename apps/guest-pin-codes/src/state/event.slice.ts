import { createSelector, createSlice } from "@reduxjs/toolkit"
import { filter, flow } from "lodash/fp"

type CalendarEvent = {
  eventId: string
  start: string
  end: string
  title: string
  calendarId: string
}

const stateSlice = createSlice({
  name: "event",
  initialState: {
    events: {} as Record<string, CalendarEvent>,
  },
  selectors: {
    getEvents: (state) => Object.values(state.events),
  },
  reducers: {
    fetchEvents: (state, action) => {},
    created: (state, action: { payload: CalendarEvent }) => {
      state.events[`${action.payload.calendarId}_${action.payload.eventId}`] =
        action.payload
    },
    updated: (state, action: { payload: CalendarEvent }) => {
      state.events[`${action.payload.calendarId}_${action.payload.eventId}`] =
        action.payload
    },
    removed: (state, action: { payload: CalendarEvent }) => {
      delete state.events[
        `${action.payload.calendarId}_${action.payload.eventId}`
      ]
    },
  },
})

const notStartedEvents = filter<CalendarEvent>((calendarEvent) => {
  const now = new Date()
  return new Date(calendarEvent.start) >= now
})

const eventsStartingBeforeAnHourFromNow = filter<CalendarEvent>(
  (calendarEvent) => {
    const now = new Date()
    now.setTime(now.getTime() + 60 * 60 * 1000)
    return new Date(calendarEvent.start) <= now
  },
)
const readyEvents = flow([notStartedEvents, eventsStartingBeforeAnHourFromNow])

const getEventsReadyToAssignToLock = createSelector(
  stateSlice.selectors.getEvents,
  (events) => readyEvents(events),
)

export default stateSlice.reducer
export type { CalendarEvent }
export { getEventsReadyToAssignToLock }
export const { created, fetchEvents, updated, removed } = stateSlice.actions
export const { getEvents } = stateSlice.selectors
