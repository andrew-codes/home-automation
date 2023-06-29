import createDebugger from "debug"
import { call, fork, put, select, takeLatest } from "redux-saga/effects"
import { isEmpty } from "lodash"
import { get } from "lodash/fp"
// import { createMqtt } from "@ha/mqtt-client"
import { FetchEventsAction } from "./actions"
import getClient from "./graphClient"
import {
  getAlreadyAssignedEventIds,
  getAvailableLockSlots,
  getCodes,
} from "./selectors"
import { assignGuestSlot, setCodesInPool } from "./actionCreators"
import candidateCodes from "./candidateCodes"

const debug = createDebugger("@ha/guest-pin-codes/sagas")

function* fetchEvents(action: FetchEventsAction) {
  try {
    const { GUEST_PIN_CODES_CALENDAR_ID } = process.env
    const { start, end } = action.payload
    debug(
      `Fetching calendar events between ${start.toTimeString()} and ${end.toTimeString()}`,
    )

    const client = getClient()
    const getEvents = client.api(`groups/${GUEST_PIN_CODES_CALENDAR_ID}/events`)
    const { value: events } = yield call(getEvents.get)

    console.dir(events)

    yield put({ type: "ATTEMPT_TO_FREE_SLOTS", payload: events.map(get("id")) })

    if (isEmpty(events)) {
      throw new Error("No events found")
    }

    const codes = yield select(getCodes)
    const availableSlots = yield select(getAvailableLockSlots)
    const assignedEventIds = yield select(getAlreadyAssignedEventIds)

    const eventsToAssign = events.filter(
      ({ id }) => !assignedEventIds.includes(id),
    )

    for (let eventIndex = 0; eventIndex < eventsToAssign.length; eventIndex++) {
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
          availableSlots[eventIndex],
          eventsToAssign[eventIndex].id,
          new Date(eventsToAssign[eventIndex].start.dateTime),
          new Date(eventsToAssign[eventIndex].end.dateTime),
          codes[eventIndex],
        ),
      )
    }
  } catch (error) {
    debug(error)
  }
}

// function* startEvent(action: ScheduleEventsAction) {
//   try {
//     yield put(fetchGuestWifiNetworkInformation())
//     yield take(
//       (action) =>
//         action.type === "FETCH_GUEST_WIFI_NETWORK_INFORMATION" &&
//         action.meta !== undefined,
//     )
//     const guestNetwork = yield select(getGuestWifiNetwork)
//     const guestNetworkMessage = !!guestNetwork
//       ? `
// Wifi: ${guestNetwork.ssid}
// Wifi Password: ${guestNetwork.password}`
//       : ``

//     const { GUEST_PIN_CODES_CALENDAR_ID } = process.env

//     const now = action.payload as Date
//     debug(`Scheduling events to start; ${now.toTimeString()}`)
//     const startingEvents = yield select(getStartingEvents)
//     const codes = yield select(getCodes)
//     const doorLocks = yield select(getDoorLocks)
//     let availableSlots = yield select(getAvailableLockSlots)
//     const currentCodeIndex = yield select(getCurrentCodeIndex)
//     let code = codes[currentCodeIndex]
//     const calendar = createCalendarClient()
//     for (let eventIndex = 0; eventIndex < startingEvents.length; eventIndex++) {
//       try {
//         const slotNumber = availableSlots[eventIndex]
//         if (!slotNumber) {
//           continue
//         }

//         const calendarEvent = startingEvents[eventIndex]
//         const nextCodeIndex = getNextCodeIndex(
//           codes.length,
//           currentCodeIndex,
//           eventIndex + 1,
//         )
//         code = codes[nextCodeIndex]

//         yield call<
//           calendar_v3.Calendar,
//           (
//             params?: calendar_v3.Params$Resource$Events$Update,
//             options?: Common.MethodOptions,
//           ) => Common.GaxiosPromise<calendar_v3.Schema$Event>
//         >(
//           [calendar, calendar.events.update],
//           {
//             calendarId: GUEST_PIN_CODES_CALENDAR_ID as string,
//             eventId: calendarEvent.id,
//             sendUpdates: "all",
//             requestBody: {
//               ...calendarEvent,
//               sequence: calendarEvent.sequence + 1,
//               description: `ACCESS CODE: ${code}${guestNetworkMessage}
// =================

// This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, contact Andrew or Dorri.

// * To Unlock the door, enter the access code above.
// * To Lock the door when you leave, press the "Yale" logo at the top of the keypad.

// Thank you!`,
//             },
//           },
//           {},
//         )
//         const mqtt = yield call(createMqtt)

//         for (
//           let doorLockIndex = 0;
//           doorLockIndex < doorLocks.length;
//           doorLockIndex++
//         ) {
//           const door = doorLocks[doorLockIndex]
//           yield call<
//             AsyncMqttClient,
//             (
//               topic: string,
//               message: string,
//               options: IClientPublishOptions,
//             ) => Promise<IPublishPacket>
//           >([mqtt, mqtt.publish], `home/pin/${door}/${slotNumber}/set`, code, {
//             qos: 2,
//           })
//           yield call<
//             AsyncMqttClient,
//             (
//               topic: string,
//               message: string,
//               options: IClientPublishOptions,
//             ) => Promise<IPublishPacket>
//           >([mqtt, mqtt.publish], `home/pin/${door}/${slotNumber}/enable`, "", {
//             qos: 2,
//           })
//         }
//       } catch (err) {
//         debug(err)
//       }
//     }
//     for (let eventIndex = 0; eventIndex < startingEvents.length; eventIndex++) {
//       const slotNumber = availableSlots[eventIndex]
//       if (!slotNumber) {
//         continue
//       }

//       const calendarEvent = startingEvents[eventIndex]
//       yield put(assignedGuestSlot(slotNumber, calendarEvent.id))
//     }
//     yield put(lastUsedCode(code))
//   } catch (error) {
//     debug(error)
//   }
// }

function* fetchEventsSaga() {
  yield takeLatest("FETCH_EVENTS", fetchEvents)
}

function* sagas() {
  yield fork(fetchEventsSaga)
}

export default sagas
