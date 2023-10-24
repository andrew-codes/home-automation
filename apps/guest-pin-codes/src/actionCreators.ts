import {
  CreateGuestSlotsAction,
  EventFetchAction,
  SetDoorLocks,
  SetGuestWifiNetworkInformationAction,
  SetPinsInPoolAction,
} from "./actions"

const fetchEvents = (): EventFetchAction => {
  return {
    type: "EVENT/FETCH",
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
  fetchEvents,
  createGuestSlots,
  setGuestWifiNetworkInformation,
}
