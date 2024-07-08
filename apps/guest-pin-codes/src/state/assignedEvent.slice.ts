import { createSlice } from "@reduxjs/toolkit"

const stateSlice = createSlice({
  name: "assignedEvent",
  initialState: {
    assignedEvents: {} as Record<string, string>,
  },
  selectors: {
    getAssignedCodes: (state) => Object.values(state.assignedEvents),
  },
  reducers: {
    assigned: (state, action) => {
      state.assignedEvents[action.payload.eventId] = action.payload.code
    },
    unassigned: (state, action) => {
      delete state.assignedEvents[action.payload.eventId]
    },
  },
})

export default stateSlice.reducer
export const { getAssignedCodes } = stateSlice.selectors
export const { assigned, unassigned } = stateSlice.actions
