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
      return merge({}, state, {
        device: {
          devices: {
            [action.payload.device.id]: {
              status: action.payload.device.status,
            },
          },
        },
      })
    }
  }

  return state
}

export default reducer
