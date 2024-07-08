import createDebugger from "debug"

const debug = createDebugger("@ha/guest-pin-codes/saga/errors")

function* logError(action: { type: "ERROR"; payload: { error: Error } }) {
  debug(action.payload.error)
}

export default logError
