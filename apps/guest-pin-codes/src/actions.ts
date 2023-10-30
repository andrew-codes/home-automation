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
    start: string
    end: string
    title: string
  }
}

type EventTimeChangeAction = {
  type: "EVENT/TIME_CHANGE"
  payload: {
    calendarId: string
    eventId: string
    start: string
    end: string
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

type SlotAssignAction = {
  type: "SLOT/ASSIGN"
  payload: {
    calendarId: string
    eventId: string
    pin: string
    slotId: string
    title: string
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
  | SlotAssignAction
  | EventFetchAction
  | EventNewAction
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
  SlotAssignAction,
  EventFetchAction,
  EventNewAction,
  EventRemoveAction,
  EventTimeChangeAction,
  EventTitleChangeAction,
  SetDoorLocks,
  SetGuestWifiNetworkInformationAction,
  SetPinsInPoolAction,
}
