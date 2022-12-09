import type { AnyAction, State } from "./types"
import { merge, uniq } from "lodash"

const defaultState: State = { macs: [] }

const reducer = (state = defaultState, action: AnyAction) => {
  switch (action.type) {
    case "UPDATE_MACS":
      const newState: State = merge({}, state)
      newState.macs = uniq(newState.macs.concat(action.payload))
      return newState
    default:
      return state
  }
}

export default reducer
export { defaultState }
