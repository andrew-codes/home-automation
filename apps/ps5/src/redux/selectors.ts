import { Device, State } from "./types"

const getDevices = (state: State): Device[] =>
  Object.values(state.devices)

const getDeviceRegistry = (state: State): Record<string, Device> => state.devices

export { getDevices, getDeviceRegistry }
