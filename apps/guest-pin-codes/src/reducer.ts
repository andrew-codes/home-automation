import createDebugger from "debug"
import { keyBy, merge } from "lodash"
import {
  ADD_CODES_TO_POOL,
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
  doorLocks: [],
  codes: [],
  codeIndex: 0,
  guestSlots: {},
}

const getNextCodeIndex = (length, currentIndex, offset) => {
  if (currentIndex + offset >= length) {
    return (currentIndex + offset) % length
  }
  return currentIndex + offset
}

const reducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case ADD_FUTURE_CALENDAR_EVENTS:
      const processedCalenderEventIds = Object.keys(state.calendarEvents)
      const newCalendarEvents: any[] = payload
        .filter(
          (calendarEvent) =>
            !processedCalenderEventIds.includes(calendarEvent.id) &&
            !calendarEvent.isScheduled
        )
        .map((calendarEvent, index) => {
          const pin =
            state.codes[
              getNextCodeIndex(state.codes.length, state.codeIndex, index)
            ]
          return merge(calendarEvent, {
            pin,
          })
        })

      const newCodeIndex =
        (state.codeIndex + newCalendarEvents.length) % state.codes.length

      return merge({}, state, {
        calendarEvents: keyBy(newCalendarEvents, "id"),
        codeIndex: newCodeIndex,
      })

    case CALENDAR_EVENTS_SCHEDULED:
      const newStateEventsScheduled = merge({}, state)
      payload.forEach((calEvent) => {
        newStateEventsScheduled.calendarEvents[calEvent.id].isScheduled = true
      })
      return newStateEventsScheduled

    case SET_LOCK_PIN:
      return merge({}, state, {
        guestSlots: {
          [payload.slotNumber]: payload.pin,
        },
      })

    case UNSET_LOCK_PIN:
      return merge({}, state, {
        guestSlots: {
          [payload]: null,
        },
      })

    case SET_GUEST_SLOTS:
      return merge({}, state, {
        guestSlots: new Array(payload.numberOfGuestCodes)
          .fill("")
          .reduce(
            (acc, v, index) =>
              merge(acc, { [index + 1 + payload.guestCodeOffset]: null }),
            {}
          ),
      })

    case ADD_DOOR_LOCKS:
      return merge({}, state, { doorLocks: payload })

    case ADD_CODES_TO_POOL:
      return merge({}, state, {
        codes: payload,
      })

    default:
      return state
  }
}

export default reducer
