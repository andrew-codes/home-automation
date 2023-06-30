import createDebugger from "debug"
import { merge } from "lodash"
import { get } from "lodash/fp"
import { all, call, fork, put, select, takeLatest } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import { assignGuestSlot, setCodesInPool } from "./actionCreators"
import type {
  AssignGuestSlotAction,
  FetchEventsAction,
  FreeSlotsAction,
  PostEventUpdateAction,
} from "./actions"
import candidateCodes from "./candidateCodes"
import getClient from "./graphClient"
import { Slot } from "./reducer"
import {
  Entry,
  getAlreadyAssignedEventIds,
  getAvailableLockSlots,
  getCodes,
  getLockSlots,
} from "./selectors"

const debug = createDebugger("@ha/guest-pin-codes/sagas")

function* fetchEvents(action: FetchEventsAction) {
  try {
    const { GUEST_PIN_CODES_CALENDAR_ID } = process.env

    const client = getClient()
    const eventsApi = client.api(`/users/${GUEST_PIN_CODES_CALENDAR_ID}/events`)
    const { value: events } = yield call([eventsApi, eventsApi.get])

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

    const lockSlotEntries: Entry<string, Slot>[] = yield select(getLockSlots)
    const lockSlots = Object.fromEntries(lockSlotEntries)
    const assignedEvents = events.filter((event) =>
      lockSlotEntries.find(([_, slot]) => event.id === slot?.eventId),
    )
    for (let event of assignedEvents) {
      const slotEntry = lockSlotEntries.find(
        ([slotId]) => lockSlots[slotId]?.eventId === event.id,
      )
      if (slotEntry) {
        const slot = slotEntry[1]

        yield put(
          assignGuestSlot(
            event.subject,
            slot.id,
            event.id,
            new Date(event.start.dateTime),
            new Date(event.end.dateTime),
            slot.code,
          ),
        )
      }
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

function* postEventUpdate(action: PostEventUpdateAction) {
  try {
    const { GUEST_PIN_CODES_CALENDAR_ID } = process.env

    const client = getClient()
    const eventApi = client.api(
      `/users/${GUEST_PIN_CODES_CALENDAR_ID}/events/${action.payload.eventId}`,
    )
    yield call([eventApi, eventApi.patch], {
      body: {
        contentType: "text",
        content: `=================
# ACCESS CODE
${
  action.payload.code ?? "The access code will be provided closer to the event."
}
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, contact us.

* To Unlock the door, enter the access code above and then press the check mark button.
* To Lock the door when you leave, press the "Yale" logo at the top of the keypad.

Thank you!`,
      },
    })
  } catch (error) {
    debug(error)
  }
}

function* freeSlots(action: FreeSlotsAction) {
  try {
    const mqtt = yield call(createMqtt)
    for (let slotId of action.payload) {
      yield call(
        [mqtt, mqtt.publish],
        "guests/assigned-slot",
        JSON.stringify({ slotId: parseInt(slotId) }),
        { qos: 1 },
      )
    }
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

function* postEventUpdateSaga() {
  yield takeLatest("POST_EVENT_UPDATE", postEventUpdate)
}

function* freeSlotsSaga() {
  yield takeLatest("FREE_SLOTS", freeSlots)
}

function* sagas() {
  yield all(
    [
      fetchEventsSaga,
      assignGuestSlotSaga,
      postEventUpdateSaga,
      freeSlotsSaga,
    ].map((saga) => fork(saga)),
  )
}

export default sagas
