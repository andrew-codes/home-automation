import { calendar_v3 } from "googleapis"
import {
  ADD_CODES_TO_POOL,
  ADD_DOOR_LOCKS,
  ADD_FUTURE_CALENDAR_EVENTS,
  CALENDAR_EVENTS_NEED_RESCHEDULING,
  CALENDAR_EVENTS_SCHEDULED,
  SCHEDULE_EVENTS,
  FETCH_EVENTS,
  REMOVE_CALENDAR_EVENT,
  SET_GUEST_SLOTS,
  SET_LOCK_PIN,
  UNSET_LOCK_PIN,
  UPDATE_EVENTS as UPDATE_EVENTS,
  LAST_USED_CODE,
  DISABLED_EVENTS,
  ASSIGNED_GUEST_SLOT,
} from "./actions"
import getMinuteAccurateDate from "./getMinuteAccurateDate"

const addNewCalendarEvents = (calendarEvents) => ({
  type: ADD_FUTURE_CALENDAR_EVENTS,
  payload: calendarEvents,
})

const fetchEvents = (end: Date) => ({
  type: FETCH_EVENTS,
  payload: getMinuteAccurateDate(end),
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

const removeCalendarEvents = (calendarEvent) => ({
  type: REMOVE_CALENDAR_EVENT,
  payload: calendarEvent,
})

const rescheduleEvents = (calendarEvents) => ({
  type: CALENDAR_EVENTS_NEED_RESCHEDULING,
  payload: calendarEvents,
})

const scheduleEvents = (start: Date) => ({
  type: SCHEDULE_EVENTS,
  payload: getMinuteAccurateDate(start),
})

const updateEvents = (events: calendar_v3.Schema$Event[]) => ({
  type: UPDATE_EVENTS,
  payload: events,
})

const lastUsedCode = (code: string) => ({
  type: LAST_USED_CODE,
  payload: code,
})

const disabledEvents = (events: calendar_v3.Schema$Event[]) => ({
  type: DISABLED_EVENTS,
  payload: events,
})

const assignedGuestSlot = (slotId: string, eventId: string) => ({
  type: ASSIGNED_GUEST_SLOT,
  payload: { id: slotId, eventId },
})

export {
  assignedGuestSlot,
  disabledEvents,
  lastUsedCode,
  updateEvents,
  addCodesToPool,
  addDoorLocks,
  addNewCalendarEvents,
  calendarEventsScheduled,
  scheduleEvents,
  fetchEvents,
  removeCalendarEvents,
  rescheduleEvents,
  setGuestSlots,
  setLockPin,
  unsetLockPin,
}
