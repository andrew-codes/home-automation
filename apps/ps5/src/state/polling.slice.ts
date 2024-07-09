import { createSlice } from "@reduxjs/toolkit"

const deviceSlice = createSlice({
  name: "polling",
  initialState: {
    lastPoll: null as Date | null,
    isPolling: false,
    isPollingState: false,
  },
  selectors: {
    getShouldPoll: (state) => {
      return state.isPolling
    },
    getShouldPollState: (state) => {
      return state.isPollingState
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
    startedPollingState(state) {
      state.isPollingState = true
    },
    endedPollingState(state) {
      state.isPollingState = false
    },
  },
})

export default deviceSlice.reducer
export const {
  startedPolling,
  endedPolling,
  polled,
  startedPollingState,
  endedPollingState,
} = deviceSlice.actions
export const { getShouldPoll, getShouldPollState } = deviceSlice.selectors
