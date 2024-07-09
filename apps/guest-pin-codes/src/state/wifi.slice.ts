import { createSlice } from "@reduxjs/toolkit"

const stateSlice = createSlice({
  name: "wifi",
  initialState: {
    guestWifi: {} as Record<string, string>,
  },
  selectors: {
    getWifi: (state) => {
      return Object.entries(state.guestWifi ?? {})
    },
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
