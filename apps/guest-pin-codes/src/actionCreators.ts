import {
  ADD_FUTURE_CALENDAR_EVENTS,
  CALENDAR_EVENT_SCHEDULED,
  FETCH_NEW_CALENDAR_EVENTS,
  SET_LOCK_PIN,
  UNSET_LOCK_PIN,
} from "./actions"

const addNewCalendarEvents = (calendarEvents) => ({
  type: ADD_FUTURE_CALENDAR_EVENTS,
  payload: calendarEvents,
})
const fetchNewCalendarEvents = () => ({
  type: FETCH_NEW_CALENDAR_EVENTS,
  payload: null,
})
const calendarEventScheduled = (calendarEvent) => ({
  type: CALENDAR_EVENT_SCHEDULED,
  payload: {
    calendarEvent,
  },
})
const setLockPin = (entity_id, pin) => ({
  type: SET_LOCK_PIN,
  payload: {
    entity_id,
    pin,
  },
})
const unsetLockPin = (entity_id) => ({
  type: UNSET_LOCK_PIN,
  payload: {
    entity_id,
  },
})

export {
  addNewCalendarEvents,
  calendarEventScheduled,
  fetchNewCalendarEvents,
  setLockPin,
  unsetLockPin,
}
