import { createSelector, createSlice } from "@reduxjs/toolkit"
import { uniq } from "lodash"
import { shuffle } from "../shuffle"
import { getAssignedCodes } from "./assignedEvent.slice"

const stateSlice = createSlice({
  name: "pinCode",
  initialState: {
    codes: [] as Array<string>,
  },
  selectors: {
    getPins: (state) => state.codes,
  },
  reducers: {
    addedCodes: (state, action) => {
      const exclusionCodes = (
        process.env.GUEST_PIN_CODES_GUEST_LOCK_CODE_EXCLUSIONS ?? ""
      ).split(",")

      state.codes = uniq(
        state.codes.concat(
          action.payload.filter((code) => !exclusionCodes.includes(code)),
        ),
      )
    },
  },
})

const getAvailableCodes = createSelector(
  stateSlice.selectors.getPins,
  getAssignedCodes,
  (allCodes, usedCodes) => {
    return allCodes.filter((code) => !usedCodes.includes(code)) as Array<string>
  },
)
const getNextCode = (state) => {
  const codes = getAvailableCodes(state)
  return shuffle(codes)[0]
}

export default stateSlice.reducer
export { getNextCode }
export const { getPins } = stateSlice.selectors
export const { addedCodes } = stateSlice.actions
