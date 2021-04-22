import createDebugger from "debug"
import { keyBy, merge } from "lodash"
import {
  ADD_DOOR_LOCKS,
  ADD_FUTURE_CALENDAR_EVENTS,
  CALENDAR_EVENTS_SCHEDULED,
  SET_LOCK_PIN,
  UNSET_LOCK_PIN,
  SET_GUEST_SLOTS,
} from "./actions"

const debug = createDebugger("@ha/guest-pin-codes/reducer")

const defaultState = {
  calendarEvents: {},
  guestSLots: {},
  doorLocks: [],
}
const reducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case ADD_FUTURE_CALENDAR_EVENTS:
      debug(ADD_FUTURE_CALENDAR_EVENTS)
      const processedCalenderEventIds = Object.keys(state.calendarEvents)
      const newCalendarEvents = payload.filter(
        (calendarEvent) =>
          !processedCalenderEventIds.includes(calendarEvent.id) &&
          !calendarEvent.isScheduled
      )
      debug(newCalendarEvents)

      return merge({}, state, {
        calendarEvents: keyBy(newCalendarEvents, "id"),
      })

    case CALENDAR_EVENTS_SCHEDULED:
      debug(CALENDAR_EVENTS_SCHEDULED)
      const newState = merge({}, state)
      payload.forEach((calEvent) => {
        newState.calendarEvents[calEvent.id].isScheduled = true
      })
      return newState

    case SET_LOCK_PIN:
      return merge({}, state, {
        locks: {
          [payload.slotNumber]: payload.pin,
        },
      })

    case UNSET_LOCK_PIN:
      return merge({}, state, {
        locks: {
          [payload]: null,
        },
      })

    case SET_GUEST_SLOTS:
      debug(
        new Array(payload)
          .fill("")
          .reduce((acc, v, index) => merge(acc, { [index + 1]: null }), {})
      )
      return merge({}, state, {
        guestSLots: new Array(payload)
          .fill("")
          .reduce((acc, v, index) => merge(acc, { [index + 1]: null }), {}),
      })

    case ADD_DOOR_LOCKS:
      return merge({}, state, { doorLocks: payload })

    default:
      return state
  }
}

export default reducer
