import {
  SetDoorLocks,
  FetchEventsAction,
  CreateGuestSlotsAction,
  AssignGuestSlotAction,
  SetGuestWifiNetworkInformationAction,
  SetPinsInPoolAction,
} from "./actions"

const fetchEvents = (): FetchEventsAction => {
  return {
    type: "FETCH_EVENTS",
  }
}

const addDoorLocks = (doorLocks: string[]): SetDoorLocks => ({
  type: "SET_DOOR_LOCKS",
  payload: doorLocks,
})

const createGuestSlots = (
  numberOfGuestCodes: number,
  guestCodeOffset: number,
): CreateGuestSlotsAction => ({
  type: "CREATE_GUEST_SLOTS",
  payload: {
    guestSlotOffset: guestCodeOffset,
    numberOfGuestSlots: numberOfGuestCodes,
  },
})

const setPinsInPool = (codes: string[]): SetPinsInPoolAction => ({
  type: "SET_PINS_IN_POOL",
  payload: codes,
})

const assignGuestSlot = (
  title: string,
  slotId: string,
  eventId: string,
  start: Date,
  end: Date,
  pin: string,
  timeZone: string,
  guestNetwork: { ssid: string; passPhrase: string } | null,
): AssignGuestSlotAction => ({
  type: "ASSIGN_GUEST_SLOT",
  payload: {
    title,
    slotId,
    eventId,
    start,
    end,
    pin,
    timeZone,
    guestNetwork: guestNetwork ?? undefined,
  },
})

const setGuestWifiNetworkInformation = (
  ssid: string,
  passPhrase: string,
): SetGuestWifiNetworkInformationAction => {
  return {
    type: "SET_GUEST_WIFI_NETWORK_INFORMATION",
    payload: { ssid, passPhrase },
  }
}

export {
  setPinsInPool,
  addDoorLocks,
  assignGuestSlot,
  fetchEvents,
  createGuestSlots,
  setGuestWifiNetworkInformation,
}
