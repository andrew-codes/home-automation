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

type Ps5Status = "PLAYING" | "STANDBY" | "AWAKE"
type SwitchStatus = "ON" | "OFF" | "NONE"

type DiscoverDevicesAction = {
  type: "DISCOVER_DEVICES"
}

type AddDeviceAction = {
  type: "ADD_DEVICE"
  payload: Device
}
type RegisterDeviceWithHomeAssistantAction = {
  type: "REGISTER_DEVICE"
  payload: Device
}

type UpdateHomeAssistantAction = {
  type: "UPDATE_HOME_ASSISTANT"
  payload: {
    device: Device
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

type PollDiscoveryAction = {
  type: "POLL_DISCOVERY"
}

type AnyAction =
  | RegisterDeviceWithHomeAssistantAction
  | ApplyToDeviceAction
  | AddDeviceAction
  | CheckDevicesStateAction
  | DiscoverDevicesAction
  | PollDevicesAction
  | PollDiscoveryAction
  | UpdateHomeAssistantAction

type State = {
  device: {
    devices: Record<string, Device>
    stateMapping: Record<Ps5Status, SwitchStatus>
  }
}

export type {
  RegisterDeviceWithHomeAssistantAction,
  AnyAction,
  AddDeviceAction,
  ApplyToDeviceAction,
  CheckDevicesStateAction,
  Device,
  DiscoverDevicesAction,
  PollDevicesAction,
  PollDiscoveryAction,
  Ps5Status,
  State,
  UpdateHomeAssistantAction,
  SwitchStatus,
}
