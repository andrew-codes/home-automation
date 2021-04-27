import { calendar_v3 } from "googleapis"
import {
  ADD_CODES_TO_POOL,
  ADD_DOOR_LOCKS,
  ASSIGNED_GUEST_SLOT,
  DISABLED_EVENTS,
  FETCH_EVENTS,
  LAST_USED_CODE,
  SCHEDULE_EVENTS,
  SET_GUEST_SLOTS,
  UPDATE_EVENTS,
} from "./actions"
import getMinuteAccurateDate from "./getMinuteAccurateDate"

const fetchEvents = (end: Date) => ({
  type: FETCH_EVENTS,
  payload: getMinuteAccurateDate(end),
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

const assignedGuestSlot = (slotId: string, eventId: string | null) => ({
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
  scheduleEvents,
  fetchEvents,
  setGuestSlots,
}
