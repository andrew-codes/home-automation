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
          [action.payload.device.id]: action.payload.device
        },
      })
    }

    case "TRANSITIONING": {
      return merge({}, state, {
        device: {
          devices: {
            [action.payload.id]: {
              transitioning: action.payload.transitioning,
            },
          },
        },
      })
    }
  }

  return state
}

export default reducer
