jest.mock("@ha/http-heartbeat")
jest.mock("@ha/mqtt-client")
jest.mock("redux")
jest.mock("@reduxjs/toolkit")
jest.mock("redux-saga")
jest.mock("../reducer")
jest.mock("../sagas")
jest.mock("cron", () => ({
  CronJob: jest.fn(),
}))
jest.mock("../candidateCodes")
jest.mock("../dbClient")
import { configureStore } from "@reduxjs/toolkit"
import { CronJob as mockCronJob } from "cron"
import createSagaMiddleware from "redux-saga"
import createApp from "../app"
import candidateCodes from "../candidateCodes"
import getClient from "../dbClient"
import reducer, { type CalendarEvent } from "../reducer"
import sagas from "../sagas"

jest.useFakeTimers({
  now: new Date("2023-06-01T00:00:00.000Z"),
  doNotFake: ["setTimeout", "nextTick"],
})

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
      start: "2024-01-01T00:00:00.000Z",
      end: "2024-01-02T00:00:00.000Z",
      title: "event 2",
    },
    {
      pin: "1234",
      calendarId,
      eventId: "1",
      start: "2024-01-01T00:00:00.000Z",
      end: "2024-01-02T00:00:00.000Z",
      title: "event 2",
    },
    {
      pin: "9876",
      calendarId,
      eventId: "3",
      start: "2020-01-01T00:00:00.000Z",
      end: "2020-01-02T00:00:00.000Z",
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
  ;(configureStore as jest.Mock).mockReturnValue(store)
  await createApp("", 0, calendarId)
  const dm = jest.fn().mockReturnValue([])
  const middleware = (configureStore as jest.Mock).mock.calls[0][0].middleware(
    dm,
  )

  expect(configureStore).toBeCalledWith(
    expect.objectContaining({
      reducer,
    }),
  )
  expect(middleware).toContain(sagaMiddleware)
  expect(sagaMiddleware.run).toBeCalledWith(sagas)
})

test("Guest slots and door locks are configured in the store.", async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 5, calendarId)

  expect(store.dispatch).toBeCalledWith({
    type: "CREATE_GUEST_SLOTS",
    payload: {
      numberOfGuestSlots: 5,
    },
  })

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: ["front_door", "back_door"],
  })
})

test("Empty door locks string is converted to an empty list to be dispatched.", async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  await createApp("", 5, calendarId)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_DOOR_LOCKS",
    payload: [],
  })
})

test("Store is loaded with available PINs", async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  const expectedPins = ["0", "2"]
  ;(candidateCodes as jest.Mock).mockReturnValue(expectedPins)
  await createApp("front_door,back_door", 5, calendarId)

  expect(store.dispatch).toBeCalledWith({
    type: "SET_PINS_IN_POOL",
    payload: expectedPins,
  })
})

test(`Store is seeded with existing, persisted events.

- Past events are ignored.`, async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 5, calendarId)

  expect(configureStore).toHaveBeenCalledWith(
    expect.objectContaining({
      preloadedState: expect.objectContaining({
        events: expect.objectContaining({
          [`${calendarId}:${persistedEvents[0].eventId}`]: persistedEvents[0],
          [`${calendarId}:${persistedEvents[1].eventId}`]: persistedEvents[1],
        }),
      }),
    }),
  )

  expect(configureStore).not.toHaveBeenCalledWith(
    expect.objectContaining({
      preloadedState: expect.objectContaining({
        events: expect.objectContaining({
          [`${calendarId}:${persistedEvents[2].eventId}`]: persistedEvents[2],
        }),
      }),
    }),
  )
})

test("App is returned", async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  const actual = await createApp("front_door,back_door", 5, calendarId)

  expect(actual.store).toEqual(store)
  expect(actual.start).toEqual(expect.any(Function))
})

test("Once the app is started, fetch events is dispatched and then, on every 5th minute, fetch events is dispatched with the current date", async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  let cronJobCallback
  mockCronJob.mockImplementation((timePattern, cb) => {
    if (timePattern === "*/5 * * * *") {
      cronJobCallback = cb
    }

    return {
      start,
    }
  })

  const app = await createApp("front_door,back_door", 5, calendarId)
  await app.start()

  expect(store.dispatch.mock.calls[3]).toEqual([
    { type: "EVENT/FETCH", payload: { calendarId } },
  ])

  cronJobCallback()
  expect(store.dispatch.mock.calls[4]).toEqual([
    { type: "EVENT/FETCH", payload: { calendarId } },
  ])
})

test(`Once the app is started, then every minute then upcoming events will dispatch slot assignment action.

- An event is considered upcoming if its start time is within an hour.
- Events already assigned to a slot are ignored.
- Past events are ignored.`, async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  store.getState.mockReturnValue({
    events: {
      [`${calendarId}:2`]: {
        pin: "4567",
        calendarId,
        eventId: "2",
        start: "2023-06-01T00:00:00.000Z",
        end: "2023-06-02T00:00:00.000Z",
        title: "event 1",
      },
      [`${calendarId}:4`]: {
        pin: "5684",
        calendarId,
        eventId: "4",
        start: "2023-06-01T00:00:00.000Z",
        end: "2023-06-02T00:00:00.000Z",
        title: "event 4",
        slotId: "2",
      },
      [`${calendarId}:1`]: {
        pin: "1234",
        calendarId,
        eventId: "1",
        start: "2023-05-31T23:00:00.000Z",
        end: "2023-06-02T00:00:00.000Z",
        title: "event 2",
      },
      [`${calendarId}: 3`]: {
        pin: "9876",
        calendarId,
        eventId: "3",
        start: "2023-06-01T02:00:00.000Z",
        end: "2023-06-02T00:00:00.000Z",
        title: "event 3",
      },
    },
    guestSlots: { "1": null, "2": "4" },
  })

  let cronJobCallback
  mockCronJob.mockImplementation((timePattern, cb) => {
    if (timePattern === "*/1 * * * *") {
      cronJobCallback = cb
    }

    return {
      start,
    }
  })

  const app = await createApp("front_door,back_door", 5, calendarId)
  await app.start()

  cronJobCallback()

  expect(store.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "SLOT/ASSIGN",
      payload: {
        calendarId,
        eventId: "2",
        pin: "4567",
        slotId: "1",
        title: "event 1",
      },
    }),
  )
  expect(store.dispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({
      type: "SLOT/ASSIGN",
      payload: expect.objectContaining({
        pin: "1234",
      }),
    }),
  )
  expect(store.dispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({
      type: "SLOT/ASSIGN",
      payload: expect.objectContaining({
        pin: "5684",
      }),
    }),
  )
  expect(store.dispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({
      type: "SLOT/ASSIGN",
      payload: expect.objectContaining({
        pin: "9876",
      }),
    }),
  )
})

test(`Once the app is started, then every minute then past events will dispatch action to remove the event.

- An event is considered in the past if its end time is in the past.`, async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  store.getState.mockReturnValue({
    events: {
      [`${calendarId}:2`]: {
        pin: "4567",
        calendarId,
        eventId: "2",
        start: "2023-06-01T00:00:00.000Z",
        end: "2023-06-02T00:00:00.000Z",
        title: "event 1",
      },
      [`${calendarId}:1`]: {
        pin: "1234",
        calendarId,
        eventId: "1",
        start: "2023-05-31T23:00:00.000Z",
        end: "2023-05-31T23:30:00.000Z",
        title: "event 2",
      },
      [`${calendarId}: 3`]: {
        pin: "9876",
        calendarId,
        eventId: "3",
        start: "2023-06-01T02:00:00.000Z",
        end: "2023-06-02T00:00:00.000Z",
        title: "event 3",
      },
    },
    guestSlots: { "1": { id: "1" }, "2": { id: "2" } },
  })

  let cronJobCallback
  mockCronJob.mockImplementation((timePattern, cb) => {
    if (timePattern === "*/1 * * * *") {
      cronJobCallback = cb
    }

    return {
      start,
    }
  })

  const app = await createApp("front_door,back_door", 5, calendarId)
  await app.start()

  cronJobCallback()

  expect(store.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "EVENT/REMOVE",
      payload: {
        calendarId,
        eventId: "1",
      },
    }),
  )
  expect(store.dispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({
      type: "EVENT/REMOVE",
      payload: expect.objectContaining({
        eventId: "2",
      }),
    }),
  )
  expect(store.dispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({
      type: "EVENT/REMOVE",
      payload: expect.objectContaining({
        eventId: "3",
      }),
    }),
  )
})

test("Fetch events is not dispatched unless the app is started", async () => {
  ;(configureStore as jest.Mock).mockReturnValue(store)
  await createApp("front_door,back_door", 5, calendarId)
  expect(store.dispatch.mock.calls).not.toContainEqual(
    expect.arrayContaining([
      expect.objectContaining({ type: "EVENT/FETCH", payload: { calendarId } }),
    ]),
  )
})
