import { merge } from "lodash"
import { AnyAction } from "./actions"

type CalendarEvent = {
  eventId: string
  start: string
  end: string
  pin: string
  title: string
  calendarId: string
  slotId?: string
}
type State = {
  pins: string[]
  doorLocks: string[]
  events: Record<string, CalendarEvent>
  guestSlots: Record<string, string | null>
  guestNetwork?: {
    ssid: string
    passPhrase: string
  }
}
const defaultState: State = {
  pins: [],
  doorLocks: [],
  events: {},
  guestSlots: {},
}

const reducer = (
  state: State | undefined = defaultState,
  action: AnyAction,
): State => {
  switch (action.type) {
    case "EVENT/NEW":
    case "EVENT/TITLE_CHANGE":
    case "EVENT/TIME_CHANGE":
      const eventUpdateId = `${action.payload.calendarId}:${action.payload.eventId}`
      return merge({}, state, {
        events: { [eventUpdateId]: action.payload },
      })

    case "EVENT/REMOVE":
      const eventRemoveId = `${action.payload.calendarId}:${action.payload.eventId}`
      const removeEventState = merge({}, state)
      const event = removeEventState.events[eventRemoveId]
      if (event?.slotId) {
        removeEventState.guestSlots[event.slotId] = null
      }
      delete removeEventState.events[eventRemoveId]
      return removeEventState

    case "SLOT/ASSIGN":
      return merge({}, state, {
        events: {
          [`${action.payload.calendarId}:${action.payload.eventId}`]: {
            slotId: action.payload.slotId,
          },
        },
        guestSlots: {
          [action.payload.slotId]: action.payload.eventId,
        },
      })

    case "SET_PINS_IN_POOL":
      return merge({}, state, { pins: action.payload })

    case "CREATE_GUEST_SLOTS":
      return merge({}, state, {
        guestSlots: new Array(action.payload.numberOfGuestSlots)
          .fill("")
          .map((v, index) => index + 1)
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
export type { CalendarEvent, State }
