import { isEmpty, merge } from "lodash"
import { AnyAction } from "./actions"

type Slot = {
  id: string
  eventId: string
  pin: string
}
type State = {
  assignedEventIds: string[]
  pins: string[]
  doorLocks: string[]
  guestSlots: Record<string, Slot | null>
  guestNetwork?: {
    ssid: string
    passPhrase: string
  }
}
const defaultState: State = {
  assignedEventIds: [],
  pins: [],
  doorLocks: [],
  guestSlots: {},
}

const hasValue = (value: string) =>
  !isEmpty(value) &&
  value.toLowerCase() !== "unknown" &&
  value.toLowerCase() !== "unavailable"

const reducer = (
  state: State | undefined = defaultState,
  action: AnyAction,
): State => {
  let newState = merge({}, state)
  switch (action.type) {
    case "SET_PINS_IN_POOL":
      return merge({}, state, { pins: action.payload })

    case "CREATE_GUEST_SLOTS":
      return merge({}, state, {
        guestSlots: new Array(action.payload.numberOfGuestSlots)
          .fill("")
          .map((v, index) => index + 1 + action.payload.guestSlotOffset)
          .reduce((acc, val) => merge(acc, { [val]: null }), {}),
      })

    case "SET_GUEST_SLOTS":
      if (isEmpty(action.payload)) {
        return state
      }

      const activeSlots = action.payload.filter(
        (slot) => hasValue(slot.eventId) && hasValue(slot.pin),
      )
      activeSlots.forEach((slot) => {
        newState.guestSlots[slot.slotId.toString()] = {
          id: slot.slotId.toString(),
          eventId: slot.eventId,
          pin: slot.pin,
        }
      })
      newState.assignedEventIds = activeSlots.map((slot) => slot.eventId)
      const activePins = activeSlots.map((slot) => slot.pin)
      newState.pins = newState.pins.filter((pin) => !activePins.includes(pin))

      return newState

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
            pin: action.payload.pin,
          },
        },
        pins: state.pins.filter((pin) => pin !== action.payload.pin),
      })
    }

    case "FREE_SLOTS":
      Object.entries(state.guestSlots).forEach(([slotId]) => {
        if (action.payload.includes(slotId)) {
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
