import { all, call, fork, takeEvery, takeLatest } from "redux-saga/effects"
import type {
  EventNewAction,
  EventRemoveAction,
  SlotAssignAction,
} from "./actions"
import assignEvent from "./sagas/assignEvent"
import fetchEventsFromCalendar from "./sagas/fetchEventsFromCalendar"
import persistEvent from "./sagas/persistEvent"
import persistEventRemoval from "./sagas/persistEventRemoval"
import persistSlotAssignmentRemoval from "./sagas/persistSlotAssignmentRemoval"
import removeEventSlot from "./sagas/removeEventSlot"
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
      call(removeEventSlot, action),
    ])
  })
}
function* assignEventSaga() {
  yield takeEvery<SlotAssignAction>("SLOT/ASSIGN", assignEvent)
}

function* sagas() {
  yield all(
    [fetchEventsSaga, eventAdditionSaga, eventRemovalSaga, assignEventSaga].map(
      (saga) => fork(saga),
    ),
  )
}

export default sagas
