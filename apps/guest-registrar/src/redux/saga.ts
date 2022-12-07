import { all, fork, takeLatest } from "redux-saga/effects"
import addGuest from "./sagas/addGuest"
import updateHomeAssistantWithGuests from "./sagas/updateHomeAssistantWithGuests"

function* addGuestSaga() {
  yield takeLatest("ADD_GUEST", addGuest)
}

function* updateHomeAssistantWithGuestsSaga() {
  yield takeLatest(
    "UPDATE_HOME_ASSISTANT_WITH_GUESTS",
    updateHomeAssistantWithGuests,
  )
}

function* saga() {
  yield all(
    [addGuestSaga, updateHomeAssistantWithGuestsSaga].map((saga) => fork(saga)),
  )
}

export default saga
