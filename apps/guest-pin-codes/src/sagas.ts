import createDebugger from "debug"
import { renderToString } from "react-dom/server"
import * as React from "react"
import { get } from "lodash/fp"
import {
  all,
  call,
  fork,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import { assignGuestSlot, setPinsInPool } from "./actionCreators"
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
  getPins,
  getLockSlots,
  getGuestWifiNetwork,
} from "./selectors"
import parseUtcToLocalDate from "./parseUtcToLocalDate"

const debug = createDebugger("@ha/guest-pin-codes/sagas")

function* fetchEvents(action: FetchEventsAction) {
  try {
    const { GUEST_PIN_CODES_CALENDAR_ID } = process.env

    const client = getClient()
    const eventsApi = client.api(`/users/${GUEST_PIN_CODES_CALENDAR_ID}/events`)
    const { value: events } = yield call([eventsApi, eventsApi.get])

    const pins = yield select(getPins)
    const availableSlots = yield select(getAvailableLockSlots)
    const assignedEventIds = yield select(getAlreadyAssignedEventIds)
    const lockSlotEntries: Entry<string, Slot>[] = yield select(getLockSlots)

    const removedEvents = assignedEventIds.filter(
      (id) => events.find((event) => event.id === id) === undefined,
    )
    const completedEvents = events.filter((event) => {
      return (
        parseUtcToLocalDate(event.end.dateTime, event.originalEndTimeZone) <
        parseUtcToLocalDate(
          new Date().toISOString().replace("Z", ""),
          event.originalEndTimeZone,
        )
      )
    })
    console.log(completedEvents)
    const eventsToDeallocate = removedEvents.concat(
      completedEvents.map(get("id")),
    )

    const lockSlots = Object.fromEntries(lockSlotEntries)
    const slotsToFree = lockSlotEntries
      .filter(([slotId, slot]) => eventsToDeallocate.includes(slot?.eventId))
      .map(get(0))
    yield put({ type: "FREE_SLOTS", payload: slotsToFree })

    const assignedEvents = events
      .filter((event) => !eventsToDeallocate.includes(event.id))
      .filter((event) =>
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
            parseUtcToLocalDate(
              event.start.dateTime,
              event.originalStartTimeZone,
            ),
            parseUtcToLocalDate(event.end.dateTime, event.originalEndTimeZone),
            slot.pin,
            event.originalStartTimeZone,
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
      if (eventIndex >= pins.length) {
        yield put(
          setPinsInPool(candidateCodes().filter((c) => !pins.includes(c))),
        )
        throw new Error("No more available codes")
      }

      const event = newEventsToAssign[eventIndex]
      yield put(
        assignGuestSlot(
          event.subject,
          availableSlots[eventIndex],
          event.id,
          parseUtcToLocalDate(
            event.start.dateTime,
            event.originalStartTimeZone,
          ),
          parseUtcToLocalDate(event.end.dateTime, event.originalEndTimeZone),
          pins[eventIndex],
          event.originalStartTimeZone,
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
      `guest/slot/${action.payload.slotId}/set`,
      JSON.stringify({
        eventId: action.payload.eventId,
        title: action.payload.title,
        slotId: parseInt(action.payload.slotId),
        pin: action.payload.pin,
        start: action.payload.start.toISOString(),
        end: action.payload.end.toISOString(),
      }),
      { qos: 1 },
    )
    yield put({
      type: "POST_EVENT_UPDATE",
      payload: { eventId: action.payload.eventId, pin: action.payload.pin },
    })
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
    const { default: CalendarInviteBody } = require("./CalendarInviteBody")

    const guestWifi = yield select(getGuestWifiNetwork)
    yield call([eventApi, eventApi.patch], {
      body: {
        contentType: "html",
        content: renderToString(
          React.createElement(CalendarInviteBody, {
            pin: action.payload.pin,
            guestWifiSsid: guestWifi?.ssid,
            guestWifiPassPhrase: guestWifi?.passPhrase,
          }),
        ),
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
        `guest/slot/${slotId}/set`,
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
  yield takeEvery("ASSIGN_GUEST_SLOT", assignGuestSlotEffects)
}

function* postEventUpdateSaga() {
  yield takeEvery("POST_EVENT_UPDATE", postEventUpdate)
}

function* freeSlotsSaga() {
  yield takeEvery("FREE_SLOTS", freeSlots)
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
