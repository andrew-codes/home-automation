import createDebugger from "debug"
import {
  call,
  fork,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects"
import { defaultTo } from "lodash"
import { calendar_v3, Common } from "googleapis"
import { createCalendarClient } from "./googleClient"
import createMqttClient from "./mqtt"
import { FETCH_EVENTS, SCHEDULE_EVENTS } from "./actions"
import {
  assignedGuestSlot,
  disabledEvents,
  lastUsedCode,
  updateEvents,
} from "./actionCreators"
import {
  getAvailableLockSlots,
  getUnassignedChronologicalEvents,
  getCodes,
  getCurrentCodeIndex,
  getDoorLocks,
  getChronologicalEvents,
  getLockSlots,
} from "./selectors"
import getMinuteAccurateDate from "./getMinuteAccurateDate"
import {
  AsyncMqttClient,
  IClientPublishOptions,
  IPublishPacket,
} from "async-mqtt"

const debug = createDebugger("@ha/guest-pin-codes/sagas")
const { GOOGLE_CALENDAR_ID } = process.env

function* fetchEvents(action) {
  try {
    const now = action.payload as Date
    debug(`Fetching calendar events ending after ${now.toTimeString()}`)
    const calendar = createCalendarClient()
    const { data } = yield call<
      calendar_v3.Calendar,
      (
        params?: calendar_v3.Params$Resource$Events$List,
        options?: Common.MethodOptions
      ) => Common.GaxiosPromise<calendar_v3.Schema$Events>
    >(
      [calendar, calendar.events.list],
      {
        calendarId: GOOGLE_CALENDAR_ID as string,
      },
      {}
    )
    const targetEvents = data.items
      ?.filter((event) => {
        const end = defaultTo(event.end.dateTime, event.end.date)
        return getMinuteAccurateDate(new Date(end)).getTime() > now.getTime()
      })
      .sort((a, b) => {
        const startA = new Date(defaultTo(a.start.dateTime, a.start.date))
        const startB = new Date(defaultTo(b.start.dateTime, b.start.date))
        if (startA.getTime() < startB.getTime()) {
          return -1
        }
        if (startA.getTime() > startB.getTime()) {
          return 1
        }
        return 0
      })
    yield put(updateEvents(targetEvents))
  } catch (error) {
    debug(error)
  }
}

const getNextCodeIndex = (length, currentIndex, offset) => {
  if (currentIndex + offset >= length) {
    return (currentIndex + offset) % length
  }
  return currentIndex + offset
}

function* startEvent(action) {
  try {
    const now = action.payload as Date
    debug(`Scheduling events to start; ${now.toTimeString()}`)
    const calendar = createCalendarClient()
    const chronologicalEvents = yield select(getUnassignedChronologicalEvents)
    const eventsToStart = chronologicalEvents.filter((event) => {
      const start = getMinuteAccurateDate(
        new Date(defaultTo(event.start.dateTime, event.start.date))
      )
      return start.toLocaleString() === now.toLocaleString()
    })
    const codes = yield select(getCodes)
    const doorLocks = yield select(getDoorLocks)
    let availableSlots = yield select(getAvailableLockSlots)
    const currentCodeIndex = yield select(getCurrentCodeIndex)
    let code = codes[currentCodeIndex]
    for (let eventIndex = 0; eventIndex < eventsToStart.length; eventIndex++) {
      try {
        const slotNumber = availableSlots[eventIndex]
        if (!slotNumber) {
          continue
        }

        const calendarEvent = eventsToStart[eventIndex]
        const nextCodeIndex = getNextCodeIndex(
          codes.length,
          currentCodeIndex,
          eventIndex + 1
        )
        code = codes[nextCodeIndex]

        yield call<
          calendar_v3.Calendar,
          (
            params?: calendar_v3.Params$Resource$Events$Update,
            options?: Common.MethodOptions
          ) => Common.GaxiosPromise<calendar_v3.Schema$Event>
        >(
          [calendar, calendar.events.update],
          {
            calendarId: GOOGLE_CALENDAR_ID as string,
            eventId: calendarEvent.id,
            sendUpdates: "all",
            requestBody: {
              ...calendarEvent,
              sequence: calendarEvent.sequence + 1,
              description: `ACCESS CODE: ${code}
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew or Dorri

Thank you!`,
            },
          },
          {}
        )
        const mqtt = yield call(createMqttClient)

        for (
          let doorLockIndex = 0;
          doorLockIndex < doorLocks.length;
          doorLockIndex++
        ) {
          const door = doorLocks[doorLockIndex]
          const doorPinId = `${door}_pin_${slotNumber}`
          yield call<
            AsyncMqttClient,
            (
              topic: string,
              message: string,
              options: IClientPublishOptions
            ) => Promise<IPublishPacket>
          >(
            [mqtt, mqtt.publish],
            "/homeassistant/guest-pin/set",
            JSON.stringify({
              entity_id: `input_text.${doorPinId}`,
              pin: code,
            }),
            { qos: 2 }
          )
          yield call<
            AsyncMqttClient,
            (
              topic: string,
              message: string,
              options: IClientPublishOptions
            ) => Promise<IPublishPacket>
          >(
            [mqtt, mqtt.publish],
            "/homeassistant/guest-pin/enable",
            JSON.stringify({
              entity_id: `input_boolean.enabled_${door}_${slotNumber}`,
            }),
            { qos: 2 }
          )
        }
      } catch (err) {
        debug(err)
      }
    }
    for (let eventIndex = 0; eventIndex < eventsToStart.length; eventIndex++) {
      const slotNumber = availableSlots[eventIndex]
      if (!slotNumber) {
        continue
      }

      const calendarEvent = eventsToStart[eventIndex]
      yield put(assignedGuestSlot(slotNumber, calendarEvent.id))
    }
    yield put(lastUsedCode(code))
  } catch (error) {
    debug(error)
  }
}

function* endEvent(action) {
  const now = action.payload as Date
  try {
    debug(`Scheduling events to end; ${now.toTimeString()}`)
    const chronologicalEvents = yield select(getChronologicalEvents)
    const eventsToStop = chronologicalEvents.filter((event) => {
      const end = getMinuteAccurateDate(
        new Date(defaultTo(event.end.dateTime, event.end.date))
      )
      return now.toLocaleString() === end.toLocaleString()
    })
    const occupiedSlots = yield select(getLockSlots)
    const doorLocks = yield select(getDoorLocks)
    const mqtt = yield call(createMqttClient)

    for (let eventIndex = 0; eventIndex < eventsToStop.length; eventIndex++) {
      const event = eventsToStop[eventIndex]
      const slot = occupiedSlots.find(([key, value]) => value === event.id)
      if (!slot) {
        continue
      }
      const slotId = slot[0]
      yield put(assignedGuestSlot(slotId, null))
      for (let doorIndex = 0; doorIndex < doorLocks.length; doorIndex++) {
        const door = doorLocks[doorIndex]
        yield call(
          [mqtt, mqtt.publish],
          "/homeassistant/guest-pin/disable",
          JSON.stringify({
            entity_id: `input_boolean.enabled_${door}_${slotId}`,
          }),
          { qos: 2 }
        )
      }
    }
    yield put(disabledEvents(eventsToStop))
  } catch (error) {
    console.log(error)
    debug(error)
  }
}

function* startEventSaga() {
  yield takeEvery(SCHEDULE_EVENTS, startEvent)
}
function* endEventSaga() {
  yield takeEvery(SCHEDULE_EVENTS, endEvent)
}
function* scheduleEventsSaga() {
  yield fork(startEventSaga)
  yield fork(endEventSaga)
}

function* fetchEventsSaga() {
  yield takeLatest(FETCH_EVENTS, fetchEvents)
}

function* sagas() {
  yield fork(fetchEventsSaga)
  yield fork(scheduleEventsSaga)
}

export default sagas
