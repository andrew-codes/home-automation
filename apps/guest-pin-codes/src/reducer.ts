import { calendar_v3 } from "googleapis"
import { defaultTo, keyBy, merge, uniq } from "lodash"
import { get } from "lodash/fp"
import { AnyAction } from "./actions"
import getMinuteAccurateDate from "./getMinuteAccurateDate"

type State = {
  events: Record<string, calendar_v3.Schema$Event>
  eventOrder: string[]
  doorLocks: string[]
  codes: string[]
  codeIndex: number
  guestSlots: Record<string, string>
  lastScheduledTime: Date | null
}
const defaultState: State = {
  events: {},
  eventOrder: [],
  doorLocks: [],
  codes: [],
  codeIndex: 0,
  guestSlots: {},
  lastScheduledTime: null,
}

const reducer = (state = defaultState, action: AnyAction) => {
  switch (action.type) {
    case "SET_EVENTS":
      const events = action.payload.filter((event) => {
        const end = defaultTo(event.end.dateTime, event.end.date)
        return getMinuteAccurateDate(new Date(end)).getTime() > Date.now()
      })
      const eventOrder = events.sort((a, b) => {
        const startA = new Date(defaultTo(a.start.dateTime, a.start.date))
        const startB = new Date(defaultTo(b.start.dateTime, b.start.date))
        if (startA.getTime() < startB.getTime()) {
          return -1
        }
        if (startA.getTime() > startB.getTime()) {
          return 1
        }
        return 0
      })

      return {
        ...state,
        events: keyBy(events, "id"),
        eventOrder: events.map(get("id")),
      }

    case "SCHEDULE_EVENTS":
      const scheduledEventsState = merge({}, state, {
        lastScheduledTime: action.payload,
      })

      return scheduledEventsState

    case "LAST_USED_CODE":
      if (!action.payload) {
        return state
      }
      const codeIndex = Math.max(
        0,
        (state.codes as string[]).indexOf(action.payload)
      )
      return merge({}, state, {
        codeIndex,
      })

    case "ASSIGNED_GUEST_SLOT":
      return merge({}, state, {
        guestSlots: { [action.payload.id]: action.payload.eventId },
      })

    case "SET_GUEST_SLOTS":
      return merge({}, state, {
        guestSlots: new Array(action.payload.numberOfGuestCodes)
          .fill("")
          .map((v, index) => index + action.payload.guestCodeOffset)
          .reduce((acc, val) => merge(acc, { [val]: null }), {}),
      })

    case "ADD_CODES_TO_POOL":
      return merge({}, state, { codes: state.codes.concat(action.payload) })

    case "ADD_DOOR_LOCKS":
      const stateWithNewDoorLocks = merge({}, state)
      stateWithNewDoorLocks.doorLocks = uniq(
        state.doorLocks.concat(action.payload),
        false
      )
      return stateWithNewDoorLocks

    default:
      return state
  }
}

export default reducer
export { defaultState, State }
