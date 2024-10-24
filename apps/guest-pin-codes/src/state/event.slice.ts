import { createSelector, createSlice } from "@reduxjs/toolkit"
import { filter, flow } from "lodash/fp"
import getNow from "../getNow"

type CalendarEvent = {
  id: string
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
      state.events[`${action.payload.calendarId}_${action.payload.id}`] =
        action.payload
    },
    updated: (state, action: { payload: CalendarEvent }) => {
      state.events[`${action.payload.calendarId}_${action.payload.id}`] =
        action.payload
    },
    removed: (state, action: { payload: CalendarEvent }) => {
      delete state.events[`${action.payload.calendarId}_${action.payload.id}`]
    },
  },
})

const notStartedEvents = filter<CalendarEvent>((calendarEvent) => {
  const now = getNow()
  return new Date(calendarEvent.start).getTime() >= now.getTime()
})

const eventsStartingBeforeAnHourFromNow = filter<CalendarEvent>(
  (calendarEvent) => {
    const now = getNow()
    now.setTime(now.getTime() + 60 * 60 * 1000)
    return new Date(calendarEvent.start).getTime() <= now.getTime()
  },
)

const inProgressEvents = filter<CalendarEvent>((calendarEvent) => {
  const now = getNow()
  return (
    new Date(calendarEvent.start).getTime() <= now.getTime() &&
    new Date(calendarEvent.end).getTime() >= now.getTime()
  )
})

const readyEvents = flow(notStartedEvents, eventsStartingBeforeAnHourFromNow)

const getEventsReadyToAssignToLock = createSelector(
  stateSlice.selectors.getEvents,
  (events) => {
    return readyEvents(events).concat(inProgressEvents(events))
  },
)

export default stateSlice.reducer
export type { CalendarEvent }
export { getEventsReadyToAssignToLock }
export const { created, fetchEvents, updated, removed } = stateSlice.actions
export const { getEvents } = stateSlice.selectors
