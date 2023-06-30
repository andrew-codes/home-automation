import createDebugger from "debug"
import { all, call, fork, put, select, takeLatest } from "redux-saga/effects"
import { isEmpty, merge } from "lodash"
import { get } from "lodash/fp"
// import { createMqtt } from "@ha/mqtt-client"
import { AssignGuestSlotAction, FetchEventsAction } from "./actions"
import getClient from "./graphClient"
import {
  getAlreadyAssignedEventIds,
  getAvailableLockSlots,
  getCodes,
  getLockSlots,
} from "./selectors"
import { assignGuestSlot, setCodesInPool } from "./actionCreators"
import candidateCodes from "./candidateCodes"
import { createMqtt } from "@ha/mqtt-client"

const debug = createDebugger("@ha/guest-pin-codes/sagas")

function* fetchEvents(action: FetchEventsAction) {
  try {
    const { GUEST_PIN_CODES_CALENDAR_ID } = process.env

    const client = getClient()
    const getEvents = client.api(`/users/${GUEST_PIN_CODES_CALENDAR_ID}/events`)
    const { value: events } = yield call([getEvents, getEvents.get])

    const codes = yield select(getCodes)
    const availableSlots = yield select(getAvailableLockSlots)
    const assignedEventIds = yield select(getAlreadyAssignedEventIds)

    const removedEvents = assignedEventIds.filter(
      (id) => events.find((event) => event.id === id) === undefined,
    )
    const completedEvents = events.filter(
      (event) => new Date(event.end.dateTime) < new Date(),
    )
    const eventsToDeallocate = removedEvents.concat(
      completedEvents.map(get("id")),
    )

    yield put({ type: "FREE_SLOTS", payload: eventsToDeallocate })

    if (isEmpty(events)) {
      throw new Error("No events found")
    }

    const newEventsToAssign = events
      .filter(({ id }) => !eventsToDeallocate.includes(id))
      .filter(({ id }) => !assignedEventIds.includes(id))

    for (
      let eventIndex = 0;
      eventIndex < newEventsToAssign.length;
      eventIndex++
    ) {
      if (eventIndex >= availableSlots.length) {
        throw new Error("No more available slots")
      }
      if (eventIndex >= codes.length) {
        yield put(
          setCodesInPool(candidateCodes().filter((c) => !codes.includes(c))),
        )
        throw new Error("No more available codes")
      }

      yield put(
        assignGuestSlot(
          newEventsToAssign[eventIndex].subject,
          availableSlots[eventIndex],
          newEventsToAssign[eventIndex].id,
          new Date(newEventsToAssign[eventIndex].start.dateTime),
          new Date(newEventsToAssign[eventIndex].end.dateTime),
          codes[eventIndex],
        ),
      )
    }
  } catch (error) {
    debug(error)
  }
}

function* assignGuestSlotEffects(action: AssignGuestSlotAction) {
  try {
    const mqtt = yield call(createMqtt)
    yield call(
      [mqtt, mqtt.publish],
      "guests/assigned-slot",
      JSON.stringify(
        merge({}, action.payload, { slotId: parseInt(action.payload.slotId) }),
      ),
      { qos: 1 },
    )
  } catch (error) {
    debug(error)
  }
}

function* fetchEventsSaga() {
  yield takeLatest("FETCH_EVENTS", fetchEvents)
}

function* assignGuestSlotSaga() {
  yield takeLatest("ASSIGN_GUEST_SLOT", assignGuestSlotEffects)
}

function* sagas() {
  yield all([fetchEventsSaga, assignGuestSlotSaga].map((saga) => fork(saga)))
}

export default sagas
