type SetCodesInPoolAction = {
  type: "SET_CODES_IN_POOL"
  payload: string[]
}

type SetDoorLocks = {
  type: "SET_DOOR_LOCKS"
  payload: string[]
}

type FetchEventsAction = {
  type: "FETCH_EVENTS"
}

type SetGuestSlotsAction = {
  type: "SET_GUEST_SLOTS"
  payload: {
    guestCodeOffset: number
    numberOfGuestCodes: number
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
    code?: string
  }
}

type FreeSlots = {
  type: "FREE_SLOTS"
  payload: string[]
}

type SetGuestWifiNetworkInformationAction = {
  type: "SET_GUEST_WIFI_NETWORK_INFORMATION"
  payload: {
    ssid: string
    password: string
  }
}

type AnyAction =
  | FreeSlots
  | SetDoorLocks
  | AssignGuestSlotAction
  | FetchEventsAction
  | SetCodesInPoolAction
  | SetGuestSlotsAction
  | SetGuestWifiNetworkInformationAction

export type {
  FreeSlots,
  SetDoorLocks,
  AnyAction,
  AssignGuestSlotAction,
  FetchEventsAction,
  SetCodesInPoolAction,
  SetGuestSlotsAction,
  SetGuestWifiNetworkInformationAction,
}
