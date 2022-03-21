import { calendar_v3 } from "googleapis"

type AddCodesToPoolAction = {
  type: "ADD_CODES_TO_POOL"
  payload: string[]
}

type AddDoorLocksAction = {
  type: "ADD_DOOR_LOCKS"
  payload: string[]
}

type FetchEventAction = {
  type: "FETCH_EVENTS"
  payload: Date
}

type SetGuestSlotsAction = {
  type: "SET_GUEST_SLOTS"
  payload: {
    guestCodeOffset: number
    numberOfGuestCodes: number
  }
}

type ScheduleEventsAction = {
  type: "SCHEDULE_EVENTS"
  payload: Date
}

type LastUsedCodeAction = {
  type: "LAST_USED_CODE"
  payload: string
}

type SetEventsAction = {
  type: "SET_EVENTS"
  payload: calendar_v3.Schema$Event[]
}

type AssignGuestSlotAction = {
  type: "ASSIGNED_GUEST_SLOT"
  payload: {
    id: string
    eventId: string | null
  }
}

type RemoveEventsAction = {
  type: "REMOVE_EVENTS"
  payload: calendar_v3.Schema$Event[]
}

type FetchGuestWifiNetworkInformationAction = {
  type: "FETCH_GUEST_WIFI_NETWORK_INFORMATION"
  meta?: { error: boolean | string }
}

type SetGuestWifiNetworkInformationAction = {
  type: "SET_GUEST_WIFI_NETWORK_INFORMATION"
  payload: {
    ssid: string
    password: string
  }
}

type AnyAction =
  | AddCodesToPoolAction
  | AddDoorLocksAction
  | AssignGuestSlotAction
  | FetchEventAction
  | FetchGuestWifiNetworkInformationAction
  | LastUsedCodeAction
  | RemoveEventsAction
  | ScheduleEventsAction
  | SetEventsAction
  | SetGuestSlotsAction
  | SetGuestWifiNetworkInformationAction

export {
  AddCodesToPoolAction,
  AddDoorLocksAction,
  AnyAction,
  AssignGuestSlotAction,
  FetchEventAction,
  FetchGuestWifiNetworkInformationAction,
  LastUsedCodeAction,
  RemoveEventsAction,
  ScheduleEventsAction,
  SetEventsAction,
  SetGuestSlotsAction,
  SetGuestWifiNetworkInformationAction,
}
