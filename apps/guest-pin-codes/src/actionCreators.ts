import {
  CreateGuestSlotsAction,
  EventFetchAction,
  SetDoorLocks,
  SetGuestWifiNetworkInformationAction,
  SetPinsInPoolAction,
} from "./actions"

const fetchEvents = (calendarId: string): EventFetchAction => {
  return {
    type: "EVENT/FETCH",
    payload: {
      calendarId,
    },
  }
}

const addDoorLocks = (doorLocks: string[]): SetDoorLocks => ({
  type: "SET_DOOR_LOCKS",
  payload: doorLocks,
})

const createGuestSlots = (
  numberOfGuestCodes: number,
): CreateGuestSlotsAction => ({
  type: "CREATE_GUEST_SLOTS",
  payload: {
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

const assignEvent = (
  slotId: string,
  {
    calendarId,
    eventId,
    pin,
    title,
  }: { calendarId: string; eventId: string; pin: string; title: string },
) => ({
  type: "SLOT/ASSIGN",
  payload: {
    calendarId,
    eventId,
    pin,
    slotId,
    title,
  },
})

const removeEvent = (calendarEvent: {
  calendarId: string
  eventId: string
}) => ({
  type: "EVENT/REMOVE",
  payload: {
    calendarId: calendarEvent.calendarId,
    eventId: calendarEvent.eventId,
  },
})

export {
  assignEvent,
  removeEvent,
  setPinsInPool,
  addDoorLocks,
  fetchEvents,
  createGuestSlots,
  setGuestWifiNetworkInformation,
}
