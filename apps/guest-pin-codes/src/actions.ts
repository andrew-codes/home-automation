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
  payload: {
    start: Date
    end: Date
  }
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
    slotId: string
    eventId: string
    start: Date
    end: Date
    code?: string
  }
}

type SetGuestWifiNetworkInformationAction = {
  type: "SET_GUEST_WIFI_NETWORK_INFORMATION"
  payload: {
    ssid: string
    password: string
  }
}

type AnyAction =
  | SetDoorLocks
  | AssignGuestSlotAction
  | FetchEventsAction
  | SetCodesInPoolAction
  | SetGuestSlotsAction
  | SetGuestWifiNetworkInformationAction

export type {
  SetDoorLocks,
  AnyAction,
  AssignGuestSlotAction,
  FetchEventsAction,
  SetCodesInPoolAction,
  SetGuestSlotsAction,
  SetGuestWifiNetworkInformationAction,
}
