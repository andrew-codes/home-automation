import { merge } from "lodash"
import type { AnyAction, State } from "./types"

const defaultState: State = {
  device: {
    devices: {},
    stateMapping: { PLAYING: "ON", STANDBY: "OFF", AWAKE: "ON" },
  },
}

const reducer = (state = defaultState, action: AnyAction) => {
  switch (action.type) {
    case "ADD_DEVICE": {
      return merge({}, state, {
        device: {
          devices: {
            [action.payload.id]: action.payload,
          },
        },
      })
    }

    case "UPDATE_HOME_ASSISTANT": {
      const statusEntries = Object.entries(state.device.stateMapping).find(
        ([key, value]) => value === action.payload.on
      )
      if (!statusEntries) {
        return state
      }
      return merge({}, state, {
        device: {
          devices: {
            [action.payload.device.id]: {
              status: statusEntries[0],
            },
          },
        },
      })
    }
  }

  return state
}

export default reducer
