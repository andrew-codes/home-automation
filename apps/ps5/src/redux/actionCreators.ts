import type {
  RegisterDeviceWithHomeAssistantAction,
  Device,
  DiscoverDevicesAction,
  UpdateHomeAssistantAction,
  SwitchStatus,
  ApplyToDeviceAction,
  CheckDevicesStateAction,
  PollDevicesAction,
  PollDiscoveryAction,
} from "./types"

const discoverDevices = (): DiscoverDevicesAction => ({
  type: "DISCOVER_DEVICES",
})

const registerDeviceWithHomeAssistant = (
  device
): RegisterDeviceWithHomeAssistantAction => ({
  type: "REGISTER_DEVICE",
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

const pollDiscovery = (): PollDiscoveryAction => ({
  type: "POLL_DISCOVERY",
})

const updateHomeAssistant = (device: Device): UpdateHomeAssistantAction => ({
  type: "UPDATE_HOME_ASSISTANT",
  payload: { device },
})

export {
  registerDeviceWithHomeAssistant,
  applyToDevice,
  checkDevicesState,
  discoverDevices,
  pollDevices,
  pollDiscovery,
  updateHomeAssistant,
}
