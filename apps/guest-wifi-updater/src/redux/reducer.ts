import type { AnyAction, State } from "./types"

const defaultState: State = {
  guestWifi: {},
}

const reducer = (state = defaultState, action: AnyAction) => state

export default reducer
export { defaultState }
