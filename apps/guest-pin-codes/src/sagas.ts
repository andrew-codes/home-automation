import createDebugger from "debug"
import {
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
} from "redux-saga/effects"
import { calendar_v3, Common } from "googleapis"
import { Controller } from "node-unifi"
import { createCalendarClient } from "./googleClient"
import createMqttClient from "./mqtt"
import {
  assignedGuestSlot,
  fetchGuestWifiNetworkInformation,
  lastUsedCode,
  removeEvents,
  setEvents,
  setGuestWifiNetworkInformation,
} from "./actionCreators"
import {
  getAvailableLockSlots,
  getCodes,
  getCurrentCodeIndex,
  getDoorLocks,
  getLockSlots,
  getEndingEvents,
  getStartingEvents,
  getGuestWifiNetwork,
} from "./selectors"
import {
  AsyncMqttClient,
  IClientPublishOptions,
  IPublishPacket,
} from "async-mqtt"
import {
  FetchGuestWifiNetworkInformationAction,
  ScheduleEventsAction,
} from "./actions"

const debug = createDebugger("@ha/guest-pin-codes/sagas")

function* fetchEvents(action) {
  try {
    const { GOOGLE_CALENDAR_ID } = process.env
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

function* fetchWifiInformation(action: FetchGuestWifiNetworkInformationAction) {
  console.log(action.meta)
  if (action.meta !== undefined) {
    return
  }

  try {
    const { UNIFI_IP, UNIFI_PORT, UNIFI_USERNAME, UNIFI_PASSWORD } = process.env
    const controller = new Controller({
      host: UNIFI_IP,
      port: UNIFI_PORT,
      sslverify: false,
    })
    yield call(controller.login, UNIFI_USERNAME, UNIFI_PASSWORD)
    const response = yield call<
      () => { data: { is_guest: boolean; x_passphrase: string }[] }
    >(controller.getWLanSettings)
    console.log(response)

    const firstGuestNetwork = response.data.find(
      (network) => !!network.is_guest
    )
    yield put(
      setGuestWifiNetworkInformation(
        firstGuestNetwork.name,
        firstGuestNetwork.x_passphrase
      )
    )
    yield put(fetchGuestWifiNetworkInformation(false))
  } catch (error: any) {
    debug(error.toString())
    yield put(fetchGuestWifiNetworkInformation(error.toString()))
  }
}

function* fetchGuestWifiNetworkInformationSaga() {
  yield takeEvery("FETCH_GUEST_WIFI_NETWORK_INFORMATION", fetchWifiInformation)
}

function* startEvent(action: ScheduleEventsAction) {
  try {
    yield put(fetchGuestWifiNetworkInformation())
    yield take(
      (action) =>
        action.type === "FETCH_GUEST_WIFI_NETWORK_INFORMATION" &&
        action.meta !== undefined
    )
    const guestNetwork = yield select(getGuestWifiNetwork)
    const guestNetworkMessage = !!guestNetwork
      ? `
Wifi: ${guestNetwork.ssid}
Wifi Password: ${guestNetwork.password}`
      : ``

    const { GOOGLE_CALENDAR_ID } = process.env

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
              description: `ACCESS CODE: ${code}${guestNetworkMessage}
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code contact Andrew or Dorri.

* To Unlock the door, enter the access code above.
* To Lock the door when you leave, press the "Schalge" logo at the top of the keypad.

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
          yield call<
            AsyncMqttClient,
            (
              topic: string,
              message: string,
              options: IClientPublishOptions
            ) => Promise<IPublishPacket>
          >([mqtt, mqtt.publish], `home/pin/${door}/${slotNumber}/set`, code, {
            qos: 2,
          })
          yield call<
            AsyncMqttClient,
            (
              topic: string,
              message: string,
              options: IClientPublishOptions
            ) => Promise<IPublishPacket>
          >([mqtt, mqtt.publish], `home/pin/${door}/${slotNumber}/enable`, "", {
            qos: 2,
          })
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
    const { GOOGLE_CALENDAR_ID } = process.env
    const now = action.payload
    const calendar = createCalendarClient()
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
          `home/pin/${door}/${slotId}/disable`,
          "",
          { qos: 2 }
        )
      }
      try {
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
            eventId: event.id,
            requestBody: {
              ...event,
              sequence: event.sequence + 1,
              description: `The access code for this event has expired. If you feel this is in error, please contact Andrew or Dorri.

Thank you!`,
            },
          },
          {}
        )
      } catch (calendarApiError) {
        debug(calendarApiError)
      }
    }
    yield put(removeEvents(endingEvents))
  } catch (error) {
    debug(error)
  }
}

function* startEventSaga() {
  yield takeEvery("SCHEDULE_EVENTS", startEvent)
}
function* endEventSaga() {
  yield takeEvery("SCHEDULE_EVENTS", endEvent)
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
  yield fork(fetchGuestWifiNetworkInformationSaga)
  yield fork(scheduleEventsSaga)
}

export default sagas
