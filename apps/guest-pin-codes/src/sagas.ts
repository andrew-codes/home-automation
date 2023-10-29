import { all, call, fork, takeEvery, takeLatest } from "redux-saga/effects"
import type { EventNewAction, EventRemoveAction } from "./actions"
import fetchEventsFromCalendar from "./sagas/fetchEventsFromCalendar"
import persistEvent from "./sagas/persistEvent"
import persistEventRemoval from "./sagas/persistEventRemoval"
import persistSlotAssignmentRemoval from "./sagas/persistSlotAssignmentRemoval"
import updateCalendarEventWithPin from "./sagas/updateCalendarInviteWithPin"

function* fetchEventsSaga() {
  yield takeLatest("EVENT/FETCH", fetchEventsFromCalendar)
}

function* eventAdditionSaga() {
  yield takeEvery<EventNewAction>("EVENT/NEW", function* (action) {
    yield all([
      call(persistEvent, action),
      call(updateCalendarEventWithPin, action),
    ])
  })
}

function* eventRemovalSaga() {
  yield takeEvery<EventRemoveAction>("EVENT/REMOVE", function* (action) {
    yield all([
      call(persistEventRemoval, action),
      call(persistSlotAssignmentRemoval, action),
    ])
  })
}

function* sagas() {
  yield all(
    [fetchEventsSaga, eventAdditionSaga, eventRemovalSaga].map((saga) =>
      fork(saga),
    ),
  )
}

export default sagas
