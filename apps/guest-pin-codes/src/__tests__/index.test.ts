jest.mock("redux")
jest.mock("redux-saga")
jest.mock("../reducer")
jest.mock("../sagas")
jest.mock("../shuffle")
const cronJob = jest.fn()
jest.mock("cron", () => ({
  CronJob: cronJob,
}))
const codes = ["0", "1", "2"]
jest.mock("../candidateCodes", () => codes)
jest.mock("../getMinuteAccurateDate")
import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"
import { when } from "jest-when"
import run from "../index"
import getMinuteAccurateDate from "../getMinuteAccurateDate"
import reducer from "../reducer"
import sagas from "../sagas"
import {
  ADD_CODES_TO_POOL,
  ADD_DOOR_LOCKS,
  FETCH_EVENTS,
  SCHEDULE_EVENTS,
  SET_GUEST_SLOTS,
} from "../actions"
import { shuffle } from "../shuffle"

let store
let sagaMiddleware
let start
beforeEach(() => {
  jest.resetAllMocks()
  store = { dispatch: jest.fn(), subscribe: jest.fn(), getState: jest.fn() }
  sagaMiddleware = { run: jest.fn() }
  ;(createSagaMiddleware as jest.Mock).mockReturnValue(sagaMiddleware)
  start = jest.fn()
  cronJob.mockImplementation(() => ({ start }))
})

test("store is created with the reducer and redux saga middleware", async () => {
  const middleware = jest.fn()
  when(applyMiddleware).calledWith(sagaMiddleware).mockReturnValue(middleware)
  when(createStore).calledWith(reducer, middleware).mockReturnValue(store)
  await run("", "", 0, 0)

  expect(sagaMiddleware.run).toBeCalledWith(sagas)
})

test("guest slots and door locks are configured in the store", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await run("front_door,back_door", "", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: SET_GUEST_SLOTS,
    payload: {
      guestCodeOffset: 1,
      numberOfGuestCodes: 5,
    },
  })

  expect(store.dispatch).toBeCalledWith({
    type: ADD_DOOR_LOCKS,
    payload: ["front_door", "back_door"],
  })
})

test("empty door locks string is converted to an empty list to be dispatched", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await run("", "", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: ADD_DOOR_LOCKS,
    payload: [],
  })
})

test("store is loaded with available codes; excluding specified codes and in a shuffled order", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const expectedCodes = ["0", "2"]
  when(shuffle).calledWith(expectedCodes).mockReturnValue(expectedCodes)
  await run("front_door,back_door", "1", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: ADD_CODES_TO_POOL,
    payload: expectedCodes,
  })
})

test("empty code exclusions string excludes no codes", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const expectedCodes = ["0", "1", "2"]
  when(shuffle).calledWith(expectedCodes).mockReturnValue(expectedCodes)
  await run("front_door,back_door", "", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: ADD_CODES_TO_POOL,
    payload: expectedCodes,
  })
})

test("immediately fetches events and processes events to be scheduled", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const now = new Date()
  jest.spyOn(global, "Date").mockImplementation(() => now as any)
  when(getMinuteAccurateDate).calledWith(now).mockReturnValue(now)
  await run("front_door,back_door", "", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: FETCH_EVENTS,
    payload: now,
  })
  expect(store.dispatch).toBeCalledWith({
    type: SCHEDULE_EVENTS,
    payload: now,
  })
})

test("every 5th minute, fetch events is dispatched with the current date", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const now = new Date()
  jest.spyOn(global, "Date").mockImplementation(() => now as any)
  when(getMinuteAccurateDate).calledWith(now).mockReturnValue(now)
  cronJob.mockImplementationOnce((timePattern, cb) => {
    expect(timePattern).toEqual("*/5 * * * *")
    cb()
    expect(store.dispatch.mock.calls[3]).toEqual([
      {
        type: FETCH_EVENTS,
        payload: now,
      },
    ])

    return {
      start,
    }
  })

  await run("front_door,back_door", "", 1, 5)
})

test("every minute, events are processed to be scheduled", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const now = new Date()
  jest.spyOn(global, "Date").mockImplementation(() => now as any)
  when(getMinuteAccurateDate).calledWith(now).mockReturnValue(now)
  cronJob.mockImplementationOnce(() => ({ start }))
  cronJob.mockImplementationOnce((timePattern, cb) => {
    expect(timePattern).toEqual("*/1 * * * *")
    cb()
    expect(store.dispatch.mock.calls[3]).toEqual([
      {
        type: SCHEDULE_EVENTS,
        payload: now,
      },
    ])

    return {
      start,
    }
  })

  await run("front_door,back_door", "", 1, 5)
})
