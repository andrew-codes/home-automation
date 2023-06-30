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
    code: string
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
  | FreeSlotsAction
  | SetDoorLocks
  | AssignGuestSlotAction
  | FetchEventsAction
  | PostEventUpdateAction
  | SetCodesInPoolAction
  | SetGuestSlotsAction
  | SetGuestWifiNetworkInformationAction

export type {
  FreeSlotsAction,
  SetDoorLocks,
  AnyAction,
  AssignGuestSlotAction,
  FetchEventsAction,
  PostEventUpdateAction,
  SetCodesInPoolAction,
  SetGuestSlotsAction,
  SetGuestWifiNetworkInformationAction,
}
