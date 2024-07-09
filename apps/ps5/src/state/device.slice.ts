import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type DiscoveredPlayStation = {
  id: string
  name: string
  available: boolean
  type: "PS5" | "PS4"
  extras: {
    status: "STANDBY" | "AWAKE"
    statusCode: number
    statusMessage: string
  }
  address: {
    address: string
    port: number
  }
  systemVersion: string
}
type PlayStationState = "STANDBY" | "AWAKE" | "UNKNOWN"
type PlayStation = {
  id: string
  name: string
  available: boolean
  type: "PS5" | "PS4"
  state: {
    name: PlayStationState
    statusCode: number
    statusMessage: string
  }
  address: {
    ip: string
    port: number
  }
  systemVersion: string
}

const deviceSlice = createSlice({
  name: "device",
  initialState: {
    devices: {} as Record<string, PlayStation>,
  },
  selectors: {
    getKnownPlayStations: (state) => {
      return Object.values(state.devices ?? {})
    },
  },
  reducers: {
    playStationDiscovered: (
      state,
      action: PayloadAction<DiscoveredPlayStation>,
    ) => {
      state.devices[action.payload.id] = {
        id: action.payload.id,
        name: action.payload.name,
        available: action.payload.available,
        type: action.payload.type,
        state: {
          name: action.payload.extras.status,
          statusCode: action.payload.extras.statusCode,
          statusMessage: action.payload.extras.statusMessage,
        },
        address: {
          ip: action.payload.address.address,
          port: action.payload.address.port,
        },
        systemVersion: action.payload.systemVersion,
      } as PlayStation
    },
    updatedPlayStation: (
      state,
      action: PayloadAction<
        DiscoveredPlayStation & {
          available: boolean
          extras: {
            status: "STANDBY" | "AWAKE" | "UNKNOWN"
          }
        }
      >,
    ) => {
      state.devices[action.payload.id].state = {
        name: action.payload.extras.status,
        statusCode: action.payload.extras.statusCode,
        statusMessage: action.payload.extras.statusMessage,
      }
      state.devices[action.payload.id].available = action.payload.available
    },
    turnedOn: (state, action: PayloadAction<{ id: string }>) => {
      state[action.payload.id].state.name = "AWAKE"
    },
    turnedOff: (state, action: PayloadAction<{ id: string }>) => {
      state[action.payload.id].state.name = "STANDBY"
    },
  },
})

export default deviceSlice.reducer
export type { PlayStation, PlayStationState, DiscoveredPlayStation }
export const {
  playStationDiscovered,
  turnedOn,
  turnedOff,
  updatedPlayStation,
} = deviceSlice.actions
export const { getKnownPlayStations } = deviceSlice.selectors
