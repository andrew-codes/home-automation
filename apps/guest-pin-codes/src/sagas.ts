import createDebugger from "debug"
import {
  all,
  call,
  delay,
  fork,
  put,
  select,
  takeEvery,
} from "redux-saga/effects"
import getNow from "./getNow"
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
import {
  assigned,
  getAssigned,
  getPastAssignedEventIds,
  unassigned,
} from "./state/assignedEvent.slice"
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

const debugFetchEvent = createDebugger("@ha/guest-pin-codes/sagas/fetchEvents")
const debugReadyEventsAssignment = createDebugger(
  "@ha/guest-pin-codes/sagas/readyEvents",
)
const debugUnassignEvents = createDebugger(
  "@ha/guest-pin-codes/sagas/unassignEvents",
)

function* fetchEventsSaga() {
  while (true) {
    debugFetchEvent("Iteration starting")
    yield call(fetchEventsFromCalendar, {
      type: fetchEvents.type,
      payload: { calendarId: process.env.GUEST_PIN_CODES_CALENDAR_ID },
    })
    yield call(readyEventsSaga)
    yield call(unAssignOldEventsSaga)
    yield delay(60000)
  }
}

function* readyEventsSaga() {
  debugReadyEventsAssignment("Checking for events")
  try {
    const readyEvents = yield select(getEventsReadyToAssignToLock)
    const eventsAlreadyAssignedASlot = yield select(getAssignedSlots)
    const events = readyEvents.filter((readyEvent) =>
      eventsAlreadyAssignedASlot.every(
        ([id, slot]) => slot?.eventId !== readyEvent.id,
      ),
    )
    const assignedEvents = yield select(getAssigned)
    debugReadyEventsAssignment(JSON.stringify(events, null, 2))
    for (const event of events) {
      try {
        const slot = yield select(getNextSlot)
        if (slot === null) {
          throw new Error(`No available slots for event ${event.id}`)
        }
        const code = assignedEvents.find(([id, code]) => id === event.id)?.[1]
        if (!code) {
          throw new Error(`No code assigned for event ${event.id}`)
        }
        yield put(
          assignedSlot({
            slotId: slot,
            eventId: event.id,
            code,
            calendarId: event.calendarId,
          }),
        )
      } catch (error) {
        debugReadyEventsAssignment(error)
      }
    }
  } catch (error) {
    debugReadyEventsAssignment(error)
  }
}

function* unAssignOldEventsSaga() {
  debugUnassignEvents("Checking for events")
  try {
    const assignedSlots = yield select(getAssignedSlots)
    const allEvents = yield select(getEvents)
    const slotsReadyToUnassign = assignedSlots.filter(([id, slot]) => {
      const slotEvent = allEvents.find((event) => event.id === slot.eventId)
      if (!slotEvent) {
        return true
      }
      const now = getNow()
      return new Date(slotEvent.end).getTime() < now.getTime()
    })

    debugUnassignEvents("Slots ready to unassign")
    debugUnassignEvents(JSON.stringify(slotsReadyToUnassign, null, 2))
    for (const [slotId, slot] of slotsReadyToUnassign) {
      yield put(
        unassignedSlot({
          slotId: parseInt(slotId),
          eventId: slot.eventId,
          calendarId: slot.calendarId,
        }),
      )
    }

    debugUnassignEvents("Events to unassign")
    const eventsToUnAssign = yield select(getPastAssignedEventIds)
    debugUnassignEvents(JSON.stringify(eventsToUnAssign, null, 2))
    for (const eventId of eventsToUnAssign) {
      yield put(unassigned({ id: eventId }))
    }
  } catch (error) {
    debugUnassignEvents(error)
  }
}

function* eventAdditionSaga() {
  yield takeEvery<ReturnType<typeof created>>(created.type, function* (action) {
    yield call(persistEvent, action)
    if (new Date(action.payload.end).getTime() >= getNow().getTime()) {
      const code = yield select(getNextCode)
      yield put(
        assigned({
          calendarId: action.payload.calendarId,
          id: action.payload.id,
          code,
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
        eventId: action.payload.id,
      }),
    )

    const slots = yield select(getSlots)
    const [slotId] = slots
      .filter((id, slot) => !!slot)
      .find(([id, slot]) => slot?.eventId === action.payload.id) ?? [null]
    if (slotId) {
      yield put(
        unassignedSlot({
          calendarId: action.payload.calendarId,
          eventId: action.payload.id,
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
