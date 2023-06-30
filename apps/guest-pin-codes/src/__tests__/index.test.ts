jest.mock("@ha/http-heartbeat")
jest.mock("@ha/mqtt-client")
jest.mock("redux")
jest.mock("redux-saga")
jest.mock("../reducer")
jest.mock("../sagas")
jest.mock("cron", () => ({
  CronJob: jest.fn(),
}))
jest.mock("../candidateCodes")
import createSagaMiddleware from "redux-saga"
import { applyMiddleware, createStore } from "redux"
import { createHeartbeat } from "@ha/http-heartbeat"
import { CronJob as mockCronJob } from "cron"
import { when } from "jest-when"
import run from "../index"
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

test("fetch events is dispatched and then, on every 5th minute, fetch events is dispatched with the current date", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  let cronJobCallback
  mockCronJob.mockImplementationOnce((timePattern, cb) => {
    expect(timePattern).toEqual("*/5 * * * *")
    cronJobCallback = cb

    return {
      start,
    }
  })

  await run("front_door,back_door", 1, 5)
  expect(store.dispatch.mock.calls[3]).toEqual([{ type: "FETCH_EVENTS" }])

  cronJobCallback()
  expect(store.dispatch.mock.calls[4]).toEqual([{ type: "FETCH_EVENTS" }])
})
