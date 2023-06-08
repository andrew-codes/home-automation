import { all, delay, fork, put, takeLatest } from "redux-saga/effects"
import addGuest from "./sagas/addGuest"
import updateHomeAssistantWithGuests from "./sagas/updateHomeAssistantWithGuests"
import { updateHomeAssistantWithGuests as updateHomeAssistantWithGuestsActionCreator } from "./actionCreators"

function* addGuestSaga() {
  yield takeLatest("ADD_GUEST", addGuest)
}

function* updateHomeAssistantWithGuestsSaga() {
  yield takeLatest(
    "UPDATE_HOME_ASSISTANT_WITH_GUESTS",
    updateHomeAssistantWithGuests,
  )
}

function* periodicUpdateHomeAssistantWithGuestsSaga() {
  while (true) {
    yield delay(1000 * 60)
    yield put(updateHomeAssistantWithGuestsActionCreator())
  }
}

function* saga() {
  yield all(
    [
      addGuestSaga,
      updateHomeAssistantWithGuestsSaga,
      periodicUpdateHomeAssistantWithGuestsSaga,
    ].map((saga) => fork(saga)),
  )
}

export default saga
