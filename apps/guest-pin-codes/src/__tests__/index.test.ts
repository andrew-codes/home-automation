jest.mock("@ha/http-heartbeat")
jest.mock("@ha/mqtt-client")
jest.mock("redux")
jest.mock("redux-saga")
jest.mock("../reducer")
jest.mock("../sagas")
jest.mock("cron", () => ({
  CronJob: jest.fn(),
}))
const codes = ["0", "1", "2"]
jest.mock("../candidateCodes")
jest.mock("../getMinuteAccurateDate")
jest.mock("../actionCreators", () => ({
  ...jest.requireActual("../actionCreators"),
  fetchEvents: jest.fn(),
}))
import createSagaMiddleware from "redux-saga"
import { applyMiddleware, createStore } from "redux"
import { createHeartbeat } from "@ha/http-heartbeat"
import { CronJob as mockCronJob } from "cron"
import { when } from "jest-when"
import run from "../index"
import getMinuteAccurateDate from "../getMinuteAccurateDate"
import reducer from "../reducer"
import sagas from "../sagas"
import candidateCodes from "../candidateCodes"

let store
let sagaMiddleware
let start
beforeEach(() => {
  jest.resetAllMocks()
  store = { dispatch: jest.fn(), subscribe: jest.fn(), getState: jest.fn() }
  sagaMiddleware = { run: jest.fn() }
  ;(createSagaMiddleware as jest.Mock).mockReturnValue(sagaMiddleware)
  start = jest.fn()
  mockCronJob.mockImplementation(() => ({ start }))
})

test("sets up a heartbeat health check", async () => {
  jest.mocked(createStore).mockReturnValue(store)
  await run("", 0, 0)

  expect(createHeartbeat).toBeCalled()
})

test("store is created with the reducer and redux saga middleware", async () => {
  const middleware = jest.fn()
  when(applyMiddleware).calledWith(sagaMiddleware).mockReturnValue(middleware)
  when(createStore).calledWith(reducer, middleware).mockReturnValue(store)
  await run("", 0, 0)

  expect(sagaMiddleware.run).toBeCalledWith(sagas)
})

test("guest slots and door locks are configured in the store", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await run("front_door,back_door", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_GUEST_SLOTS",
    payload: {
      guestCodeOffset: 1,
      numberOfGuestCodes: 5,
    },
  })

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: ["front_door", "back_door"],
  })
})

test("empty door locks string is converted to an empty list to be dispatched", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await run("", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: [],
  })
})

test("store is loaded with available codes", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const expectedCodes = ["0", "2"]
  ;(candidateCodes as jest.Mock).mockReturnValue(expectedCodes)
  await run("front_door,back_door", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_CODES_IN_POOL",
    payload: expectedCodes,
  })
})

describe.skip("", () => {
  test("immediately fetches events and processes events to be scheduled", async () => {
    ;(createStore as jest.Mock).mockReturnValue(store)
    const now = new Date()
    jest.spyOn(global, "Date").mockImplementation(() => now as any)
    when(getMinuteAccurateDate).calledWith(now).mockReturnValue(now)
    await run("front_door,back_door", 1, 5)

    expect(store.dispatch).toBeCalledWith({
      type: "FETCH_EVENTS",
      payload: now,
    })
    expect(store.dispatch).toBeCalledWith({
      type: "SCHEDULE_EVENTS",
      payload: now,
    })
  })

  test("every 5th minute, fetch events is dispatched with the current date", async () => {
    ;(createStore as jest.Mock).mockReturnValue(store)
    const now = new Date()
    jest.spyOn(global, "Date").mockImplementation(() => now as any)
    when(getMinuteAccurateDate).calledWith(now).mockReturnValue(now)
    mockCronJob.mockImplementationOnce((timePattern, cb) => {
      expect(timePattern).toEqual("*/5 * * * *")
      cb()
      expect(store.dispatch.mock.calls[3]).toEqual([
        {
          type: "FETCH_EVENTS",
          payload: now,
        },
      ])

      return {
        start,
      }
    })

    await run("front_door,back_door", 1, 5)
  })
})
