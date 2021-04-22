import createDebugger from "debug"
import { keyBy, merge } from "lodash"
import {
  ADD_FUTURE_CALENDAR_EVENTS,
  CALENDAR_EVENT_SCHEDULED,
  SET_LOCK_PIN,
  UNSET_LOCK_PIN,
} from "./actions"

const debug = createDebugger("@ha/guest-pin-code/reducer")

const defaultState = {
  toBeScheduled: {},
}
const reducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case ADD_FUTURE_CALENDAR_EVENTS:
      debug(ADD_FUTURE_CALENDAR_EVENTS)
      const processedCalenderEventIds = Object.keys(state.toBeScheduled)
      const newCalendarEvents = payload.filter(
        (calendarEvent) => !processedCalenderEventIds.includes(calendarEvent.id)
      )
      debug(newCalendarEvents)

      return merge({}, state, {
        toBeScheduled: keyBy("id", newCalendarEvents),
      })

    case CALENDAR_EVENT_SCHEDULED:
      debug(CALENDAR_EVENT_SCHEDULED)
      const newState = merge({}, state)
      delete newState.toBeScheduled[payload.id]
      return newState

    case SET_LOCK_PIN:
      return merge({}, state, {
        locks: {
          [payload.entity_id]: payload.pin,
        },
      })

    case UNSET_LOCK_PIN:
      return merge({}, state, {
        locks: {
          [payload.entity_id]: null,
        },
      })

    default:
      return state
  }
}

export default reducer
