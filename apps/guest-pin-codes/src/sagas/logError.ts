import createDebugger from "debug"
import { ErrorAction } from "../actions"

const debug = createDebugger("@ha/guest-pin-codes/saga/errors")

function* logError(action: ErrorAction) {
  debug(action.payload.error)
}

export default logError
