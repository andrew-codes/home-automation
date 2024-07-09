import { createSelector, createSlice } from "@reduxjs/toolkit"

const stateSlice = createSlice({
  name: "lock",
  initialState: {
    slots: {} as Record<
      number,
      { code: string; eventId: string; calendarId: string } | null
    >,
  },
  selectors: {
    getSlots: (state) => Object.entries(state.slots),
  },
  reducers: {
    created: (state, action) => {
      if (state.slots[action.payload.slotId]) {
        return
      }
      state.slots[action.payload.slotId] = null
    },
    assignedSlot: (state, action) => {
      state.slots[action.payload.slotId] = {
        code: action.payload.code,
        eventId: action.payload.eventId,
        calendarId: action.payload.calendarId,
      }
    },
    unassignedSlot: (state, action) => {
      state.slots[action.payload.slotId] = null
    },
  },
})

const getAvailableLockSlots = createSelector(
  stateSlice.selectors.getSlots,
  (slots) => {
    return slots
      .filter(([_, slot]) => !slot)
      .map(([slotId]) => parseInt(slotId))
  },
)
const getAssignedSlots = createSelector(
  stateSlice.selectors.getSlots,
  (slots) => slots.filter(([_, slot]) => !!slot),
)
const getNextSlot = createSelector(getAvailableLockSlots, (availableSlots) => {
  return availableSlots[0] ?? null
})

export default stateSlice.reducer
export { getNextSlot, getAssignedSlots }
export const { getSlots } = stateSlice.selectors
export const { created, assignedSlot, unassignedSlot } = stateSlice.actions
