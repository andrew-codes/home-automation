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
  }

  return state
}

export default reducer
