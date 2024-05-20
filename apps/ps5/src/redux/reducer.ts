import { merge } from "lodash"
import type { AnyAction, State } from "./types"

const defaultState: State = {
  devices: {},
}

const reducer = (state = defaultState, action: AnyAction) => {
  switch (action.type) {
    case "UPDATE_HOME_ASSISTANT": {
      return merge({}, state, {
        devices: {
          [action.payload.device.id]: merge({}, action.payload.device, {
            status: action.payload.device.extras.status,
          }),
        },
      })
    }
    case "CLEAR_ALL_DEVICES":
      const newState = merge({}, state)
      state.devices = {}

      return state
    default:
      return state
  }

  return state
}

export default reducer
