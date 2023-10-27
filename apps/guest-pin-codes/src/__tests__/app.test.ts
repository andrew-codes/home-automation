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
jest.mock("../dbClient")
import { CronJob as mockCronJob } from "cron"
import { when } from "jest-when"
import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"
import createApp from "../app"
import candidateCodes from "../candidateCodes"
import getClient from "../dbClient"
import reducer, { type CalendarEvent } from "../reducer"
import sagas from "../sagas"

let store
let sagaMiddleware
let start
const calendarId = "cal_id"
let persistedEvents: CalendarEvent[]
beforeEach(() => {
  jest.resetAllMocks()
  store = { dispatch: jest.fn(), subscribe: jest.fn(), getState: jest.fn() }
  sagaMiddleware = { run: jest.fn() }
  ;(createSagaMiddleware as jest.Mock).mockReturnValue(sagaMiddleware)
  start = jest.fn()
  mockCronJob.mockImplementation(() => ({ start }))

  persistedEvents = [
    {
      pin: "4567",
      calendarId,
      eventId: "2",
      start: "2020-01-01T00:00:00.000Z",
      end: "2020-01-02T00:00:00.000Z",
      title: "event 2",
    },
    {
      pin: "1234",
      calendarId,
      eventId: "1",
      start: "2019-01-01T00:00:00.000Z",
      end: "2019-01-02T00:00:00.000Z",
      title: "event 2",
    },
  ]
  ;(getClient as jest.Mock).mockResolvedValue({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(persistedEvents),
        }),
      }),
    }),
  })
})

test("Store is created with the reducer and redux saga middleware.", async () => {
  const middleware = jest.fn()
  when(applyMiddleware).calledWith(sagaMiddleware).mockReturnValue(middleware)
  when(createStore).calledWith(reducer, middleware).mockReturnValue(store)
  await createApp("", 0, 0, calendarId)

  expect(sagaMiddleware.run).toBeCalledWith(sagas)
})

test("Guest slots and door locks are configured in the store.", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 1, 5, calendarId)

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

test("Empty door locks string is converted to an empty list to be dispatched.", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("", 1, 5, calendarId)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: [],
  })
})

test("Store is loaded with available PINs", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const expectedPins = ["0", "2"]
  ;(candidateCodes as jest.Mock).mockReturnValue(expectedPins)
  await createApp("front_door,back_door", 1, 5, calendarId)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_PINS_IN_POOL",
    payload: expectedPins,
  })
})

test("Persisted events are each dispatched as new events in chronological order.", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 1, 5, calendarId)

  expect(store.dispatch.mock.calls[3][0]).toEqual({
    type: "EVENT/NEW",
    payload: {
      pin: "1234",
      calendarId,
      eventId: "1",
      start: "2019-01-01T00:00:00.000Z",
      end: "2019-01-02T00:00:00.000Z",
      title: "event 2",
    },
  })
  expect(store.dispatch.mock.calls[4][0]).toEqual({
    type: "EVENT/NEW",
    payload: {
      pin: "4567",
      calendarId,
      eventId: "2",
      start: "2020-01-01T00:00:00.000Z",
      end: "2020-01-02T00:00:00.000Z",
      title: "event 2",
    },
  })
})

test("App is returned", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  const actual = await createApp("front_door,back_door", 1, 5, calendarId)

  expect(actual.store).toEqual(store)
  expect(actual.start).toEqual(expect.any(Function))
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

  const app = await createApp("front_door,back_door", 1, 5, calendarId)
  await app.start()

  expect(store.dispatch.mock.calls[5]).toEqual([
    { type: "EVENT/FETCH", payload: { calendarId } },
  ])

  cronJobCallback()
  expect(store.dispatch.mock.calls[6]).toEqual([
    { type: "EVENT/FETCH", payload: { calendarId } },
  ])
})

test("Fetch events is not dispatched unless the app is started", async () => {
  ;(createStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 1, 5, calendarId)
  console.dir(store.dispatch.mock.calls)
  expect(store.dispatch.mock.calls).not.toContainEqual(
    expect.arrayContaining([
      expect.objectContaining({ type: "EVENT/FETCH", payload: { calendarId } }),
    ]),
  )
})
