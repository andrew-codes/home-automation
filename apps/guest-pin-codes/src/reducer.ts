import { defaultTo, keyBy, merge, uniq } from "lodash"
import { get } from "lodash/fp"
import { AnyAction } from "./actions"

type State = {
  assignedEventIds: string[]
  codes: string[]
  doorLocks: string[]
  guestSlots: Record<string, string>
  guestNetwork?: {
    ssid: string
    password: string
  }
}
const defaultState: State = {
  assignedEventIds: [],
  codes: [],
  doorLocks: [],
  guestSlots: {},
}

const reducer = (
  state: State | undefined = defaultState,
  action: AnyAction,
): State => {
  switch (action.type) {
    case "SET_CODES_IN_POOL":
      return merge({}, state, { codes: action.payload })

    case "SET_GUEST_SLOTS":
      return merge({}, state, {
        guestSlots: new Array(action.payload.numberOfGuestCodes)
          .fill("")
          .map((v, index) => index + action.payload.guestCodeOffset)
          .reduce((acc, val) => merge(acc, { [val]: null }), {}),
      })

    case "SET_DOOR_LOCKS":
      return merge({}, state, { doorLocks: action.payload })

    case "SET_GUEST_WIFI_NETWORK_INFORMATION": {
      return merge({}, state, { guestNetwork: action.payload })
    }

    case "ASSIGN_GUEST_SLOT": {
      return merge({}, state, {
        guestSlots: { [action.payload.slotId]: action.payload.eventId },
        codes: state.codes.filter((code) => code !== action.payload.code),
      })
    }

    case "FREE_SLOTS":
      const newState = merge({}, state)
      Object.entries(state.guestSlots).forEach(([slotId, eventId]) => {
        if (action.payload.includes(eventId)) {
          newState.guestSlots[slotId] = null
        }
      })
      return newState

    default:
      return state
  }
}

export default reducer
export { defaultState }
export type { State }
