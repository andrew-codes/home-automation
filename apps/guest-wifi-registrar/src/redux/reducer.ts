import type { AnyAction, State } from "./types"
import { merge } from "lodash"

const defaultState: State = {
  guestWifi: {},
}

const reducer = (state = defaultState, action: AnyAction) => {
  switch (action.type) {
    case "ADD_GUEST_WIFI_NETWORK": {
      return merge({}, state, {
        guestWifi: { [action.payload.id]: action.payload },
      })
    }

    case "SET_GUEST_WIFI_PASS_PHRASE": {
      return merge({}, state, {
        guestWifi: {
          [action.payload.network.id]: {
            passPhrase: action.payload.passPhrase,
          },
        },
      })
    }
    default:
      return state
  }
}

export default reducer
export { defaultState }
