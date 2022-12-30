import { calendar_v3 } from "googleapis"
import {
  AddCodesToPoolAction,
  AddDoorLocksAction,
  FetchEventAction,
  SetGuestSlotsAction,
  ScheduleEventsAction,
  LastUsedCodeAction,
  SetEventsAction,
  AssignGuestSlotAction,
  RemoveEventsAction,
  FetchGuestWifiNetworkInformationAction,
  SetGuestWifiNetworkInformationAction,
} from "./actions"
import getMinuteAccurateDate from "./getMinuteAccurateDate"

const fetchEvents = (end: Date): FetchEventAction => ({
  type: "FETCH_EVENTS",
  payload: getMinuteAccurateDate(end),
})

const addDoorLocks = (doorLocks: string[]): AddDoorLocksAction => ({
  type: "ADD_DOOR_LOCKS",
  payload: doorLocks,
})

const setGuestSlots = (
  numberOfGuestCodes: number,
  guestCodeOffset: number,
): SetGuestSlotsAction => ({
  type: "SET_GUEST_SLOTS",
  payload: { guestCodeOffset, numberOfGuestCodes },
})

const addCodesToPool = (codes: string[]): AddCodesToPoolAction => ({
  type: "ADD_CODES_TO_POOL",
  payload: codes,
})

const scheduleEvents = (start: Date): ScheduleEventsAction => ({
  type: "SCHEDULE_EVENTS",
  payload: getMinuteAccurateDate(start),
})

const setEvents = (
  events: (calendar_v3.Schema$Event & { id: string })[],
): SetEventsAction => ({
  type: "SET_EVENTS",
  payload: events,
})

const removeEvents = (
  events: (calendar_v3.Schema$Event & { id: string })[],
): RemoveEventsAction => ({
  type: "REMOVE_EVENTS",
  payload: events,
})

const lastUsedCode = (code: string): LastUsedCodeAction => ({
  type: "LAST_USED_CODE",
  payload: code,
})

const assignedGuestSlot = (
  slotId: string,
  eventId: string | null,
): AssignGuestSlotAction => ({
  type: "ASSIGNED_GUEST_SLOT",
  payload: { id: slotId, eventId },
})

const fetchGuestWifiNetworkInformation = (
  error?: string | boolean,
): FetchGuestWifiNetworkInformationAction => {
  if (!error) {
    return { type: "FETCH_GUEST_WIFI_NETWORK_INFORMATION" }
  }

  return {
    type: "FETCH_GUEST_WIFI_NETWORK_INFORMATION",
    meta: { error },
  }
}

const setGuestWifiNetworkInformation = (
  ssid: string,
  password: string,
): SetGuestWifiNetworkInformationAction => {
  return {
    type: "SET_GUEST_WIFI_NETWORK_INFORMATION",
    payload: { ssid, password },
  }
}

export {
  addCodesToPool,
  addDoorLocks,
  assignedGuestSlot,
  fetchEvents,
  fetchGuestWifiNetworkInformation,
  lastUsedCode,
  removeEvents,
  scheduleEvents,
  setEvents,
  setGuestSlots,
  setGuestWifiNetworkInformation,
}
