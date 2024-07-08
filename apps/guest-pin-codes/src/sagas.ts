import {
  all,
  call,
  delay,
  fork,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects"
import assignLockSlot from "./sagas/assignLockSlot"
import fetchEventsFromCalendar from "./sagas/fetchEventsFromCalendar"
import logError from "./sagas/logError"
import persistAssignedEvent from "./sagas/persistAssignedEvent"
import persistAssignedEventRemoval from "./sagas/persistAssignedEventRemoval"
import persistEvent from "./sagas/persistEvent"
import persistEventRemoval from "./sagas/persistEventRemoval"
import persistGuestWifi from "./sagas/persistGuestWifi"
import persistLockAssignment from "./sagas/persistLockAssignment"
import persistLockAssignmentRemoval from "./sagas/persistLockAssignmentRemoval"
import unassignLockSlot from "./sagas/unassignLockSlot"
import updateCalendarEventWithPin from "./sagas/updateCalendarInviteWithPin"
import { assigned, unassigned } from "./state/assignedEvent.slice"
import {
  created,
  fetchEvents,
  getEvents,
  getEventsReadyToAssignToLock,
  removed,
  updated,
} from "./state/event.slice"
import {
  assignedSlot,
  getAssignedSlots,
  getNextSlot,
  getSlots,
  unassignedSlot,
} from "./state/lock.slice"
import { getNextCode } from "./state/pinCode.slice"
import { setWifi } from "./state/wifi.slice"

function* fetchEventsSaga() {
  while (true) {
    yield takeLatest(fetchEvents.type, fetchEventsFromCalendar)
    yield delay(60000)
  }
}

function* readyEventsSaga() {
  while (true) {
    const readyEvents = yield select(getEventsReadyToAssignToLock)
    for (const readyEvent of readyEvents) {
      try {
        const slot = yield select(getNextSlot)
        if (!slot) {
          throw new Error(`No available slots for event ${readyEvent.eventId}`)
        }
        yield put(
          assignedSlot({
            slotId: slot,
            eventId: readyEvent.eventId,
            code: readyEvent.code,
            calendarId: readyEvent.calendarId,
          }),
        )
      } catch (error) {
        yield put({ type: "ERROR", payload: error })
      }
    }
    yield delay(55000)
  }
}

function* unAssignOldEventsSaga() {
  while (true) {
    const assignedSlots = yield select(getAssignedSlots)
    const allEvents = yield select(getEvents)
    const slotsReadyToUnassign = assignedSlots.filter(([id, slot]) => {
      const slotEvent = allEvents.find(
        (event) => event.eventId === slot.eventId,
      )
      if (!slotEvent) {
        return true
      }
      const now = new Date()
      return new Date(slotEvent.end) > now
    })

    for (const [slotId, slot] of slotsReadyToUnassign) {
      yield put(
        unassignedSlot({
          slotId: parseInt(slotId),
          eventId: slot.eventId,
          calendarId: slot.calendarId,
        }),
      )
    }
    yield delay(55000)
  }
}

function* eventAdditionSaga() {
  yield takeEvery<ReturnType<typeof created>>(created.type, function* (action) {
    yield call(persistEvent, action)
    if (new Date(action.payload.end).getTime() >= new Date().getTime()) {
      const code = yield select(getNextCode)
      yield put(
        assigned({
          calendarId: action.payload.calendarId,
          eventId: action.payload.eventId,
          code: code,
        }),
      )
    }
  })
}

function* eventAssignedCodeSaga() {
  yield takeEvery<ReturnType<typeof assigned>>(
    assigned.type,
    function* (action) {
      yield all([
        call(persistAssignedEvent, action),
        call(updateCalendarEventWithPin, action),
      ])
    },
  )
}

function* eventUpdatedSaga() {
  yield takeEvery<ReturnType<typeof updated>>(updated.type, function* (action) {
    yield call(persistEvent, action)
  })
}

function* eventRemovalSaga() {
  yield takeEvery<ReturnType<typeof removed>>(removed.type, function* (action) {
    yield put(
      unassigned({
        calendarId: action.payload.calendarId,
        eventId: action.payload.eventId,
      }),
    )

    const slots = yield select(getSlots)
    const [slotId] = slots.find(
      ([id, slot]) => slot.eventId === action.payload.eventId,
    ) ?? [null]
    if (slotId) {
      yield put(
        unassignedSlot({
          calendarId: action.payload.calendarId,
          eventId: action.payload.eventId,
          slotId,
        }),
      )
    }
    yield call(persistEventRemoval, action)
  })
}

function* unassignedEventSaga() {
  yield takeEvery<ReturnType<typeof unassigned>>(
    unassigned.type,
    function* (action) {
      yield call(persistAssignedEventRemoval, action)
    },
  )
}

function* unassignedSlotSaga() {
  yield takeEvery<ReturnType<typeof unassignedSlot>>(
    unassignedSlot.type,
    function* (action) {
      yield call(persistLockAssignmentRemoval, action)
      yield call(unassignLockSlot, action)
    },
  )
}

function* setWifiSaga() {
  yield takeEvery<ReturnType<typeof setWifi>>(setWifi.type, function* (action) {
    yield call(persistGuestWifi, action)
  })
}

function* assignLockSlotSaga() {
  yield takeEvery<ReturnType<typeof assignedSlot>>(
    assignedSlot.type,
    function* (action) {
      yield call(assignLockSlot, action)
      yield call(persistLockAssignment, action)
    },
  )
}

function* errorSaga() {
  yield takeEvery("ERROR", logError)
}

function* sagas() {
  yield all(
    [
      fetchEventsSaga,
      readyEventsSaga,
      unAssignOldEventsSaga,
      eventAdditionSaga,
      eventAssignedCodeSaga,
      eventUpdatedSaga,
      eventRemovalSaga,
      unassignedEventSaga,
      unassignedSlotSaga,
      setWifiSaga,
      assignLockSlotSaga,
      errorSaga,
    ].map((saga) => fork(saga)),
  )
}

export default sagas
