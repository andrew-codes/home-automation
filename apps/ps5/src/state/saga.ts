import { createLogger } from "@ha/logger"
import { PayloadAction } from "@reduxjs/toolkit"
import { merge } from "lodash"
import {
  all,
  call,
  delay,
  fork,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects"
import {
  DiscoveredPlayStation,
  getKnownPlayStations,
  PlayStation,
  playStationDiscovered,
  turnedOff,
  turnedOn,
  updatedPlayStation,
} from "./device.slice"
import { getShouldPoll, startedPolling } from "./polling.slice"
import { discoverDevicesEffect } from "./sideEffects/discoverDevicesEffect"
import { pollStateEffect } from "./sideEffects/pollStateEffect"
import registerWithHomeAssistantEffect from "./sideEffects/registerWithHomeAssistantEffect"
import { turnOffEffect } from "./sideEffects/turnOffEffect"
import { turnOnEffect } from "./sideEffects/turnOnEffect"
import updateHomeAssistantEffect from "./sideEffects/updateHomeAssistantEffect"

const logger = createLogger()

function* pollingToDiscover() {
  yield takeLatest(startedPolling.type, function* () {
    let shouldPoll = true
    while (shouldPoll) {
      try {
        yield call(discoverDevicesEffect)
        yield delay(150000)
        shouldPoll = yield select(getShouldPoll)
      } catch (error) {
        logger.error(error)
      }
    }
  })
}

function* pollingToCheckState() {
  yield takeLatest(startedPolling.type, function* () {
    let shouldPoll = true
    while (shouldPoll) {
      try {
        yield call(pollStateEffect)
        yield delay(1000)
        shouldPoll = yield select(getShouldPoll)
      } catch (error) {
        logger.error(error)
      }
    }
  })
}

function* discovered() {
  yield takeEvery(
    playStationDiscovered.type,
    function* (action: PayloadAction<DiscoveredPlayStation>) {
      const knownPlayStations: Array<PlayStation> = yield select(
        getKnownPlayStations,
      )
      const ps = knownPlayStations.find((p) => p.id === action.payload.id)
      if (ps) {
        yield call(updateHomeAssistantEffect, ps)
      } else {
        yield call(registerWithHomeAssistantEffect, action)
      }
    },
  )
}

function* update() {
  yield takeEvery(
    updatedPlayStation.type,
    function* (
      action: PayloadAction<
        DiscoveredPlayStation & {
          available: boolean
          extras: {
            status: "STANDBY" | "AWAKE" | "UNKNOWN"
          }
        }
      >,
    ) {
      const knownPlayStations: Array<PlayStation> = yield select(
        getKnownPlayStations,
      )
      const ps = knownPlayStations.find((p) => p.id === action.payload.id)
      if (!ps) {
        return
      }
      yield call(
        updateHomeAssistantEffect,
        merge({}, ps, {
          available: action.payload.available,
          state: {
            name: action.payload.extras.status,
            statusCode: action.payload.extras.statusCode,
            statusMessage: action.payload.extras.statusMessage,
          },
        }),
      )
    },
  )
}

function* turnOn() {
  yield takeLatest(turnedOn.type, function* (action: PayloadAction<string>) {
    const knownPlayStations: Array<PlayStation> = yield select(
      getKnownPlayStations,
    )
    const ps = knownPlayStations.find((p) => p.id === action.payload)
    if (ps) {
      yield call(turnOnEffect, ps)
      yield call(updateHomeAssistantEffect, ps)
    }
  })
}

function* turnOff() {
  yield takeLatest(turnedOff.type, function* (action: PayloadAction<string>) {
    const knownPlayStations: Array<PlayStation> = yield select(
      getKnownPlayStations,
    )
    const ps = knownPlayStations.find((p) => p.id === action.payload)
    if (ps) {
      yield call(turnOffEffect, ps)
      yield call(updateHomeAssistantEffect, ps)
    }
  })
}

function* saga() {
  yield all(
    [
      pollingToDiscover,
      discovered,
      turnOn,
      turnOff,
      update,
      pollingToCheckState,
    ].map((saga) => fork(saga)),
  )
}

export default saga
function merge(
  arg0: {},
  ps: PlayStation,
  arg2: {
    available: boolean
    state: {
      name: "STANDBY" | "AWAKE"
      statusCode: number
      statusMessage: string
    }
  },
): PlayStation {
  throw new Error("Function not implemented.")
}
