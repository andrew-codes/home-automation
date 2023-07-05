type SetPinsInPoolAction = {
  type: "SET_PINS_IN_POOL"
  payload: string[]
}

type SetGuestSlotsAction = {
  type: "SET_GUEST_SLOTS"
  payload: { slotId: number; eventId: string; pin: string }[]
}

type SetDoorLocks = {
  type: "SET_DOOR_LOCKS"
  payload: string[]
}

type FetchEventsAction = {
  type: "FETCH_EVENTS"
}

type CreateGuestSlotsAction = {
  type: "CREATE_GUEST_SLOTS"
  payload: {
    guestSlotOffset: number
    numberOfGuestSlots: number
  }
}

type AssignGuestSlotAction = {
  type: "ASSIGN_GUEST_SLOT"
  payload: {
    title: string
    slotId: string
    eventId: string
    start: Date
    end: Date
    pin: string
    timeZone: string
  }
}

type FreeSlotsAction = {
  type: "FREE_SLOTS"
  payload: string[]
}

type PostEventUpdateAction = {
  type: "POST_EVENT_UPDATE"
  payload: {
    eventId: string
    pin?: string
  }
}

type SetGuestWifiNetworkInformationAction = {
  type: "SET_GUEST_WIFI_NETWORK_INFORMATION"
  payload: {
    ssid: string
    passPhrase: string
  }
}

type AnyAction =
  | FreeSlotsAction
  | SetDoorLocks
  | AssignGuestSlotAction
  | FetchEventsAction
  | PostEventUpdateAction
  | SetPinsInPoolAction
  | CreateGuestSlotsAction
  | SetGuestWifiNetworkInformationAction
  | SetGuestSlotsAction

export type {
  FreeSlotsAction,
  SetDoorLocks,
  AnyAction,
  AssignGuestSlotAction,
  FetchEventsAction,
  PostEventUpdateAction,
  SetPinsInPoolAction,
  CreateGuestSlotsAction,
  SetGuestWifiNetworkInformationAction,
  SetGuestSlotsAction,
}
