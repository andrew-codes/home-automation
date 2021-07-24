import createDebugger from "debug"
import {
  call,
  fork,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects"
import { calendar_v3, Common } from "googleapis"
import { createCalendarClient } from "./googleClient"
import createMqttClient from "./mqtt"
import { assignedGuestSlot, lastUsedCode, setEvents } from "./actionCreators"
import {
  getAvailableLockSlots,
  getCodes,
  getCurrentCodeIndex,
  getDoorLocks,
  getLockSlots,
  getEndingEvents,
  getStartingEvents,
} from "./selectors"
import {
  AsyncMqttClient,
  IClientPublishOptions,
  IPublishPacket,
} from "async-mqtt"
import { ScheduleEventsAction } from "./actions"

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
    yield put(setEvents(data.items ?? []))
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
    const startingEvents = yield select(getStartingEvents)
    const codes = yield select(getCodes)
    const doorLocks = yield select(getDoorLocks)
    let availableSlots = yield select(getAvailableLockSlots)
    const currentCodeIndex = yield select(getCurrentCodeIndex)
    let code = codes[currentCodeIndex]
    const calendar = createCalendarClient()
    for (let eventIndex = 0; eventIndex < startingEvents.length; eventIndex++) {
      try {
        const slotNumber = availableSlots[eventIndex]
        if (!slotNumber) {
          continue
        }

        const calendarEvent = startingEvents[eventIndex]
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
    for (let eventIndex = 0; eventIndex < startingEvents.length; eventIndex++) {
      const slotNumber = availableSlots[eventIndex]
      if (!slotNumber) {
        continue
      }

      const calendarEvent = startingEvents[eventIndex]
      yield put(assignedGuestSlot(slotNumber, calendarEvent.id))
    }
    yield put(lastUsedCode(code))
  } catch (error) {
    debug(error)
  }
}

function* endEvent(action: ScheduleEventsAction) {
  try {
    const now = action.payload
    debug(`Scheduling events to end; ${now.toTimeString()}`)
    const endingEvents = yield select(getEndingEvents)
    const occupiedSlots = yield select(getLockSlots)
    const doorLocks = yield select(getDoorLocks)
    const mqtt = yield call(createMqttClient)

    for (let eventIndex = 0; eventIndex < endingEvents.length; eventIndex++) {
      const event = endingEvents[eventIndex]
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
  } catch (error) {
    console.log(error)
    debug(error)
  }
}

function* startEventSaga() {
  yield takeEvery("SCHEDULE_EVENTS", startEvent)
}
function* endEventSaga() {
  yield takeEvery("SCHEUDLE_EVENTS", endEvent)
}
function* scheduleEventsSaga() {
  yield fork(startEventSaga)
  yield fork(endEventSaga)
}

function* fetchEventsSaga() {
  yield takeLatest("FETCH_EVENTS", fetchEvents)
}

function* sagas() {
  yield fork(fetchEventsSaga)
  yield fork(scheduleEventsSaga)
}

export default sagas
