import type { AnyAction, State } from "./types"

const defaultState: State = {}

const reducer = (state = defaultState, action: AnyAction) => state

export default reducer
export { defaultState }
