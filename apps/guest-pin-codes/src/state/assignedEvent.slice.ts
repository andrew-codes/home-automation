import { createSelector, createSlice } from "@reduxjs/toolkit"
import getNow from "../getNow"
import { getEvents } from "./event.slice"

const stateSlice = createSlice({
  name: "assignedEvent",
  initialState: {
    assignedEvents: {} as Record<string, string>,
  },
  selectors: {
    getAssignedEvents: (state) => Object.keys(state.assignedEvents),
    getAssignedCodes: (state) => Object.values(state.assignedEvents),
    getAssigned: (state) => Object.entries(state.assignedEvents),
  },
  reducers: {
    assigned: (state, action) => {
      state.assignedEvents[action.payload.id] = action.payload.code
    },
    unassigned: (state, action) => {
      delete state.assignedEvents[action.payload.id]
    },
  },
})

const getPastAssignedEventIds = createSelector(
  stateSlice.selectors.getAssignedEvents,
  getEvents,
  (assignedEvents, events) => {
    const now = getNow()
    return assignedEvents
      .map((eventId) => events.find((event) => event.id === eventId) ?? eventId)
      .filter((event) => typeof event === "string" || new Date(event.end) < now)
      .map((event) => (typeof event === "string" ? event : event.id))
  },
)

export default stateSlice.reducer
export const { getAssignedCodes, getAssignedEvents, getAssigned } =
  stateSlice.selectors
export const { assigned, unassigned } = stateSlice.actions
export { getPastAssignedEventIds }
