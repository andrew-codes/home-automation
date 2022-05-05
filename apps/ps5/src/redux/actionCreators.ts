import type {
  AddDeviceAction,
  Device,
  DiscoverDevicesAction,
  UpdateHomeAssistantAction,
  SwitchStatus,
  Ps5Status,
  ApplyToDeviceAction,
  CheckDevicesStateAction,
  PollDevicesAction,
} from "./types"

const discoverDevices = (): DiscoverDevicesAction => ({
  type: "DISCOVER_DEVICES",
})

const addDevice = (device): AddDeviceAction => ({
  type: "ADD_DEVICE",
  payload: device,
})

const applyToDevice = (device, onState: SwitchStatus): ApplyToDeviceAction => ({
  type: "APPLY_TO_DEVICE",
  payload: {
    device,
    on: onState,
  },
})

const checkDevicesState = (): CheckDevicesStateAction => ({
  type: "CHECK_DEVICES_STATE",
})

const pollDevices = (): PollDevicesAction => ({
  type: "POLL_DEVICES",
})

const updateHomeAssistant = (
  device: Device,
  on: SwitchStatus
): UpdateHomeAssistantAction => ({
  type: "UPDATE_HOME_ASSISTANT",
  payload: { device, on },
})

export {
  addDevice,
  applyToDevice,
  checkDevicesState,
  discoverDevices,
  pollDevices,
  updateHomeAssistant,
}
