import { keyBy, merge } from "lodash"
import { get } from "lodash/fp"
import { ASSIGNED_GUEST_SLOT, LAST_USED_CODE, UPDATE_EVENTS } from "./actions"

export const defaultState = {
  events: {},
  eventOrder: [],
  doorLocks: [],
  codes: [],
  codeIndex: 0,
  guestSlots: {},
}

const reducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case UPDATE_EVENTS:
      return {
        ...state,
        events: keyBy(payload, "id"),
        eventOrder: payload.map(get("id")),
      }

    case LAST_USED_CODE:
      return merge({}, state, { codeIndex: state.codes.indexOf(payload) })

    case ASSIGNED_GUEST_SLOT:
      return merge({}, state, { guestSlots: { [payload.id]: payload.eventId } })

    // case REMOVE_CALENDAR_EVENT:
    //   return merge({}, state, {
    //     calendarEvents: {
    //       [payload.id]: undefined,
    //     },
    //   })

    // case ADD_FUTURE_CALENDAR_EVENTS:
    //   const processedCalenderEventIds = Object.keys(state.calendarEvents)
    //   const newCalendarEvents: any[] = payload
    //     .filter(
    //       (calendarEvent) =>
    //         !processedCalenderEventIds.includes(calendarEvent.id) &&
    //         !calendarEvent.isScheduled
    //     )
    //     .map((calendarEvent, index) => {
    //       const pin =
    //         state.codes[
    //           getNextCodeIndex(state.codes.length, state.codeIndex, index)
    //         ]
    //       return merge(calendarEvent, {
    //         pin,
    //       })
    //     })

    //   const newCodeIndex =
    //     (state.codeIndex + newCalendarEvents.length) % state.codes.length

    //   return merge({}, state, {
    //     calendarEvents: keyBy(newCalendarEvents, "id"),
    //     codeIndex: newCodeIndex,
    //   })

    // case CALENDAR_EVENTS_SCHEDULED:
    //   const scheduledEvents = payload.reduce(
    //     (acc, calEvent) => merge(acc, { [calEvent.id]: { isScheduled: true } }),
    //     {}
    //   )
    //   return merge({}, state, {
    //     calendarEvents: scheduledEvents,
    //   })

    // case CALENDAR_EVENTS_NEED_RESCHEDULING:
    //   const eventsToReschedule = payload.reduce(
    //     (acc, calEvent) =>
    //       merge(acc, {
    //         [calEvent.id]: {
    //           isScheduled: false,
    //           sequence: calEvent.sequence + 1,
    //         },
    //       }),
    //     {}
    //   )
    //   return merge({}, state, {
    //     calendarEvents: eventsToReschedule,
    //   })

    // case SET_LOCK_PIN:
    //   return merge({}, state, {
    //     guestSlots: {
    //       [payload.slotNumber]: payload.pin,
    //     },
    //   })

    // case UNSET_LOCK_PIN:
    //   return merge({}, state, {
    //     guestSlots: {
    //       [payload]: null,
    //     },
    //   })

    // case SET_GUEST_SLOTS:
    //   return merge({}, state, {
    //     guestSlots: new Array(payload.numberOfGuestCodes)
    //       .fill("")
    //       .reduce(
    //         (acc, v, index) =>
    //           merge(acc, { [index + 1 + payload.guestCodeOffset]: null }),
    //         {}
    //       ),
    //   })

    // case ADD_DOOR_LOCKS:
    //   return merge({}, state, { doorLocks: payload })

    // case ADD_CODES_TO_POOL:
    //   return merge({}, state, {
    //     codes: payload,
    //   })

    default:
      return state
  }
}

export default reducer
