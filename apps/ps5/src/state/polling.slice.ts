import { createSlice } from "@reduxjs/toolkit"

const deviceSlice = createSlice({
  name: "polling",
  initialState: {
    lastPoll: null as Date | null,
    isPolling: false,
  },
  selectors: {
    getShouldPoll: (state) => {
      return state.isPolling
    },
  },
  reducers: {
    startedPolling(state) {
      state.isPolling = true
    },
    endedPolling(state) {
      state.isPolling = false
    },
    polled: (state) => {
      state.lastPoll = new Date()
    },
  },
})

export default deviceSlice.reducer
export const { startedPolling, endedPolling, polled } = deviceSlice.actions
export const { getShouldPoll } = deviceSlice.selectors
