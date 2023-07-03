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
import { CronJob as mockCronJob } from "cron"
import { when } from "jest-when"
import createApp from "../app"
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

test("store is created with the reducer and redux saga middleware", async () => {
  const middleware = jest.fn()
  when(applyMiddleware).calledWith(sagaMiddleware).mockReturnValue(middleware)
  when(createStore).calledWith(reducer, middleware).mockReturnValue(store)
  await createApp("", 0, 0)

  expect(sagaMiddleware.run).toBeCalledWith(sagas)
})

test("guest slots and door locks are configured in the store", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: "CREATE_GUEST_SLOTS",
    payload: {
      guestSlotOffset: 1,
      numberOfGuestSlots: 5,
    },
  })

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: ["front_door", "back_door"],
  })
})

test("empty door locks string is converted to an empty list to be dispatched", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: [],
  })
})

test("store is loaded with available PINs", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const expectedPins = ["0", "2"]
  ;(candidateCodes as jest.Mock).mockReturnValue(expectedPins)
  await createApp("front_door,back_door", 1, 5)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_PINS_IN_POOL",
    payload: expectedPins,
  })
})

test("app is returned", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const actual = await createApp("front_door,back_door", 1, 5)

  expect(actual.store).toEqual(store)
})

test("Once the app is started, fetch events is dispatched and then, on every 5th minute, fetch events is dispatched with the current date", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  let cronJobCallback
  mockCronJob.mockImplementationOnce((timePattern, cb) => {
    expect(timePattern).toEqual("*/5 * * * *")
    cronJobCallback = cb

    return {
      start,
    }
  })

  const app = await createApp("front_door,back_door", 1, 5)
  await app.start()

  expect(store.dispatch.mock.calls[3]).toEqual([{ type: "FETCH_EVENTS" }])

  cronJobCallback()
  expect(store.dispatch.mock.calls[4]).toEqual([{ type: "FETCH_EVENTS" }])
})

test("Fetch events is not dispatched unless the app is started", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 1, 5)
  console.dir(store.dispatch.mock.calls)
  expect(store.dispatch.mock.calls).not.toContainEqual(
    expect.arrayContaining([expect.objectContaining({ type: "FETCH_EVENTS" })]),
  )
})
