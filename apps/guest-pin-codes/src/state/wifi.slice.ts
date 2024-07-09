import { createSlice } from "@reduxjs/toolkit"

const stateSlice = createSlice({
  name: "assignedEvent",
  initialState: {
    guestWifi: {} as Record<string, string>,
  },
  selectors: {
    getWifi: (state) => Object.entries(state.guestWifi),
  },
  reducers: {
    setWifi: (state, action) => {
      state.guestWifi[action.payload.ssid] = action.payload.passPhrase
    },
  },
})

export default stateSlice.reducer
export const { getWifi } = stateSlice.selectors
export const { setWifi } = stateSlice.actions
