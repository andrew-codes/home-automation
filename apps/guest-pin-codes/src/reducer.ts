import { merge } from "lodash"
import { AnyAction } from "./actions"

type Slot = {
  id: string
  eventId: string
  code: string
}
type State = {
  assignedEventIds: string[]
  codes: string[]
  doorLocks: string[]
  guestSlots: Record<string, Slot | null>
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
        guestSlots: {
          [action.payload.slotId]: {
            id: action.payload.slotId,
            eventId: action.payload.eventId,
            code: action.payload.code,
          },
        },
        codes: state.codes.filter((code) => code !== action.payload.code),
      })
    }

    case "FREE_SLOTS":
      const newState = merge({}, state)
      Object.entries(state.guestSlots).forEach(([slotId, slot]) => {
        if (!!slot && action.payload.includes(slot.eventId)) {
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
export type { Slot, State }
