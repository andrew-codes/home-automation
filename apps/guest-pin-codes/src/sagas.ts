import { all, fork, takeLatest } from "redux-saga/effects"
import fetchEventsFromCalendar from "./sagas/fetchEventsFromCalendar"

// function* assignGuestSlotEffects(action: AssignGuestSlotAction) {
//   try {
//     const mqtt = yield call(createMqtt)
//     yield call(
//       [mqtt, mqtt.publish],
//       `guest/slot/${action.payload.slotId}/set`,
//       JSON.stringify({
//         eventId: action.payload.eventId,
//         title: action.payload.title,
//         slotId: parseInt(action.payload.slotId),
//         pin: action.payload.pin,
//         start: action.payload.start.toISOString(),
//         end: action.payload.end.toISOString(),
//       }),
//       { qos: 1 },
//     )
//     yield put({
//       type: "POST_EVENT_UPDATE",
//       payload: { eventId: action.payload.eventId, pin: action.payload.pin },
//     })
//   } catch (error) {
//     debug(error)
//   }
// }

// function* freeSlots(action: FreeSlotsAction) {
//   try {
//     const mqtt = yield call(createMqtt)
//     for (let slotId of action.payload) {
//       yield call(
//         [mqtt, mqtt.publish],
//         `guest/slot/${slotId}/set`,
//         JSON.stringify({ slotId: parseInt(slotId) }),
//         { qos: 1 },
//       )
//     }
//   } catch (error) {
//     debug(error)
//   }
// }

function* fetchEventsSaga() {
  yield takeLatest("EVENT/FETCH", fetchEventsFromCalendar)
}

function* sagas() {
  yield all([fetchEventsSaga].map((saga) => fork(saga)))
}

export default sagas
