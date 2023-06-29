import {
  SetDoorLocks,
  FetchEventsAction,
  SetGuestSlotsAction,
  AssignGuestSlotAction,
  SetGuestWifiNetworkInformationAction,
  SetCodesInPoolAction,
} from "./actions"
import getMinuteAccurateDate from "./getMinuteAccurateDate"

const fetchEvents = (start: Date, numberOfDays: number): FetchEventsAction => {
  const end = getMinuteAccurateDate(start)
  end.setDate(start.getDate() + numberOfDays)

  return {
    type: "FETCH_EVENTS",
    payload: {
      start: getMinuteAccurateDate(start),
      end,
    },
  }
}

const addDoorLocks = (doorLocks: string[]): SetDoorLocks => ({
  type: "SET_DOOR_LOCKS",
  payload: doorLocks,
})

const setGuestSlots = (
  numberOfGuestCodes: number,
  guestCodeOffset: number,
): SetGuestSlotsAction => ({
  type: "SET_GUEST_SLOTS",
  payload: { guestCodeOffset, numberOfGuestCodes },
})

const setCodesInPool = (codes: string[]): SetCodesInPoolAction => ({
  type: "SET_CODES_IN_POOL",
  payload: codes,
})

const assignGuestSlot = (
  slotId: string,
  eventId: string,
  start: Date,
  end: Date,
  code?: string,
): AssignGuestSlotAction => ({
  type: "ASSIGN_GUEST_SLOT",
  payload: { slotId, eventId, start, end, code },
})

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
  setCodesInPool,
  addDoorLocks,
  assignGuestSlot,
  fetchEvents,
  setGuestSlots,
  setGuestWifiNetworkInformation,
}
