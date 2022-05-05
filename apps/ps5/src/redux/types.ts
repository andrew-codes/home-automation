type Device = {
  id: string
  name: string
  homeAssistantId: string
  status: Ps5Status
  type: "PS5" | "PS4"
  address: {
    address: string
    port: number
  }
}

type Ps5Status = "PLAYING" | "STANDBY"
type SwitchStatus = "ON" | "OFF"

type DiscoverDevicesAction = {
  type: "DISCOVER_DEVICES"
}

type AddDeviceAction = {
  type: "ADD_DEVICE"
  payload: Device
}

type UpdateHomeAssistantAction = {
  type: "UPDATE_HOME_ASSISTANT"
  payload: {
    device: Device
    on: SwitchStatus
  }
}

type ApplyToDeviceAction = {
  type: "APPLY_TO_DEVICE"
  payload: {
    device: Device
    on: SwitchStatus
  }
}

type CheckDevicesStateAction = {
  type: "CHECK_DEVICES_STATE"
}

type PollDevicesAction = {
  type: "POLL_DEVICES"
}

type AnyAction =
  | AddDeviceAction
  | ApplyToDeviceAction
  | CheckDevicesStateAction
  | DiscoverDevicesAction
  | PollDevicesAction
  | UpdateHomeAssistantAction

type State = {
  device: {
    devices: Record<string, Device>
    stateMapping: Record<Ps5Status, SwitchStatus>
  }
}

export type {
  AddDeviceAction,
  AnyAction,
  ApplyToDeviceAction,
  CheckDevicesStateAction,
  Device,
  DiscoverDevicesAction,
  PollDevicesAction,
  Ps5Status,
  State,
  UpdateHomeAssistantAction,
  SwitchStatus,
}
