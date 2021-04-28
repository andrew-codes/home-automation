import { keyBy, merge } from "lodash"
import { get } from "lodash/fp"
import {
  ADD_CODES_TO_POOL,
  ADD_DOOR_LOCKS,
  ASSIGNED_GUEST_SLOT,
  LAST_USED_CODE,
  SET_GUEST_SLOTS,
  UPDATE_EVENTS,
} from "./actions"

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
      if (!payload) {
        return state
      }
      const codeIndex = Math.max(0, (state.codes as string[]).indexOf(payload))
      return merge({}, state, {
        codeIndex,
      })

    case ASSIGNED_GUEST_SLOT:
      return merge({}, state, { guestSlots: { [payload.id]: payload.eventId } })

    case SET_GUEST_SLOTS:
      return merge({}, state, {
        guestSlots: new Array(payload.numberOfGuestCodes)
          .fill("")
          .map((v, index) => index + payload.guestCodeOffset)
          .reduce((acc, val) => merge(acc, { [val]: null }), {}),
      })

    case ADD_CODES_TO_POOL:
      return merge({}, state, { codes: state.codes.concat(payload) })

    case ADD_DOOR_LOCKS:
      return merge({}, state, { doorLocks: state.doorLocks.concat(payload) })

    default:
      return state
  }
}

export default reducer
