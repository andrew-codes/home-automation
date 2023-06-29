import { defaultTo, keyBy, merge, uniq } from "lodash"
import { get } from "lodash/fp"
import { AnyAction } from "./actions"
import getMinuteAccurateDate from "./getMinuteAccurateDate"

type State = {
  assignedEventIds: string[]
  codes: string[]
  doorLocks: string[]
  eventOrder: string[]
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
  eventOrder: [],
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

    default:
      return state
  }
}

export default reducer
export { defaultState }
export type { State }
