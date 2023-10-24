type EventFetchAction = {
  type: "EVENT/FETCH"
  payload: {
    calendarId: string
  }
}

type EventNewAction = {
  type: "EVENT/NEW"
  payload: {
    eventId: string
    calendarId: string
    pin: string
    start: Date
    end: Date
    title: string
  }
}

type EventRegisterRemovalProcessAction = {
  type: "EVENT/REGISTER_REMOVAL_PROCESS"
  payload: {
    calendarId: string
    eventId: string
    pid: number
  }
}

type EventTimeChangeAction = {
  type: "EVENT/TIME_CHANGE"
  payload: {
    calendarId: string
    eventId: string
    start: Date
    end: Date
  }
}

type EventTitleChangeAction = {
  type: "EVENT/TITLE_CHANGE"
  payload: {
    calendarId: string
    eventId: string
    title: string
  }
}

type EventRemoveAction = {
  type: "EVENT/REMOVE"
  payload: {
    calendarId: string
    eventId: string
  }
}

type ErrorAction = {
  type: "ERROR"
  payload: {
    error: Error | string
  }
}

type SetPinsInPoolAction = {
  type: "SET_PINS_IN_POOL"
  payload: string[]
}

type CreateGuestSlotsAction = {
  type: "CREATE_GUEST_SLOTS"
  payload: {
    guestSlotOffset: number
    numberOfGuestSlots: number
  }
}

type SetGuestWifiNetworkInformationAction = {
  type: "SET_GUEST_WIFI_NETWORK_INFORMATION"
  payload: {
    ssid: string
    passPhrase: string
  }
}

type SetDoorLocks = {
  type: "SET_DOOR_LOCKS"
  payload: string[]
}

type AnyAction =
  | CreateGuestSlotsAction
  | ErrorAction
  | EventFetchAction
  | EventNewAction
  | EventRegisterRemovalProcessAction
  | EventRemoveAction
  | EventTimeChangeAction
  | EventTitleChangeAction
  | SetDoorLocks
  | SetGuestWifiNetworkInformationAction
  | SetPinsInPoolAction

export type {
  AnyAction,
  CreateGuestSlotsAction,
  ErrorAction,
  EventFetchAction,
  EventNewAction,
  EventRegisterRemovalProcessAction,
  EventRemoveAction,
  EventTimeChangeAction,
  EventTitleChangeAction,
  SetDoorLocks,
  SetGuestWifiNetworkInformationAction,
  SetPinsInPoolAction,
}
