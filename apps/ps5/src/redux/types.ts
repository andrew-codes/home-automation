type Device = {
  id: string
  name: string
  normalizedName: string
  available: boolean
  status: SwitchStatus
  type: "PS5" | "PS4"
  extras: {
    status: Ps5Status
    statusCode: number
    statusMessage: string
  }
  address: {
    address: string
    port: number
  }
  systemVersion: string
}

type Ps5Status = "STANDBY" | "AWAKE"
type SwitchStatus = Ps5Status | "UNKNOWN"

type DiscoverDevicesAction = {
  type: "DISCOVER_DEVICES"
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

type UpdateDeviceAction = {
  type: "UPDATE_DEVICE"
  payload: Partial<Device> & { id: string }
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
  | CheckDevicesStateAction
  | DiscoverDevicesAction
  | PollDevicesAction
  | PollDiscoveryAction
  | UpdateDeviceAction
  | UpdateHomeAssistantAction

type State = {
  devices: Record<string, Device>
}

export type {
  RegisterDeviceWithHomeAssistantAction,
  AnyAction,
  ApplyToDeviceAction,
  CheckDevicesStateAction,
  Device,
  DiscoverDevicesAction,
  PollDevicesAction,
  PollDiscoveryAction,
  Ps5Status,
  State,
  UpdateHomeAssistantAction,
  UpdateDeviceAction,
  SwitchStatus,
}
