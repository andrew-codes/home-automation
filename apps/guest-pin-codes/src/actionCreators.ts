import {
  ADD_CODES_TO_POOL,
  ADD_DOOR_LOCKS,
  ADD_FUTURE_CALENDAR_EVENTS,
  CALENDAR_EVENTS_SCHEDULED,
  FETCH_NEW_CALENDAR_EVENTS,
  SET_GUEST_SLOTS,
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

const calendarEventsScheduled = (calendarEvents) => ({
  type: CALENDAR_EVENTS_SCHEDULED,
  payload: calendarEvents,
})

const setLockPin = (slotNumber, pin) => ({
  type: SET_LOCK_PIN,
  payload: {
    slotNumber,
    pin,
  },
})

const unsetLockPin = (slotNumber) => ({
  type: UNSET_LOCK_PIN,
  payload: slotNumber,
})

const addDoorLocks = (doorLocks) => ({
  type: ADD_DOOR_LOCKS,
  payload: doorLocks,
})

const setGuestSlots = (numberOfGuestCodes, guestCodeOffset) => ({
  type: SET_GUEST_SLOTS,
  payload: { guestCodeOffset, numberOfGuestCodes },
})

const addCodesToPool = (codes: string[]) => ({
  type: ADD_CODES_TO_POOL,
  payload: codes,
})

export {
  addCodesToPool,
  addDoorLocks,
  addNewCalendarEvents,
  calendarEventsScheduled,
  fetchNewCalendarEvents,
  setGuestSlots,
  setLockPin,
  unsetLockPin,
}
