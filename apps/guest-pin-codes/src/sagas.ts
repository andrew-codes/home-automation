import { all, call, fork, takeEvery, takeLatest } from "redux-saga/effects"
import type { EventNewAction } from "./actions"
import assignEvent from "./sagas/assignEvent"
import fetchEventsFromCalendar from "./sagas/fetchEventsFromCalendar"
import persistEvent from "./sagas/persistEvent"
import updateCalendarEventWithPin from "./sagas/updateCalendarInviteWithPin"

function* fetchEventsSaga() {
  yield takeLatest("EVENT/FETCH", fetchEventsFromCalendar)
}

function* newEventSaga() {
  yield takeEvery<EventNewAction>("EVENT/NEW", function* (action) {
    yield all([
      call(persistEvent, action),
      call(assignEvent, action),
      call(updateCalendarEventWithPin, action),
    ])
  })
}

function* sagas() {
  yield all([fetchEventsSaga, newEventSaga].map((saga) => fork(saga)))
}

export default sagas
