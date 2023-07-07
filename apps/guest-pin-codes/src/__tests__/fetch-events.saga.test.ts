jest.mock("../graphClient")
jest.mock("../candidateCodes")
import { when } from "jest-when"
import { expectSaga } from "redux-saga-test-plan"
import { throwError } from "redux-saga-test-plan/providers"
import * as matchers from "redux-saga-test-plan/matchers"
import sagas from "../sagas"
import graphClient from "../graphClient"
import {
  getAlreadyAssignedEventIds,
  getAvailableLockSlots,
  getPins,
  getLockSlots,
  getGuestWifiNetwork,
} from "../selectors"
import candidateCodes from "../candidateCodes"
import parseUtcToLocalDate from "../parseUtcToLocalDate"

let api
beforeEach(() => {
  jest.resetAllMocks()
  jest.useFakeTimers()
  jest.setSystemTime(new Date("2021-07-06T00:00:00.000Z"))

  process.env.GUEST_PIN_CODES_CALENDAR_ID = "cal_id"
  const client = {
    api: jest.fn(),
  }
  ;(graphClient as jest.Mock).mockReturnValue(client)

  api = { get: jest.fn() }
  when(client.api).calledWith("/users/cal_id/events").mockReturnValue(api)
})

afterAll(() => {
  jest.useRealTimers()
})

test("Network errors do not crash saga", async () => {
  expectSaga(sagas)
    .provide([
      [matchers.call([api, api.get]), throwError(new Error("API Error"))],
    ])
    .call([api, api.get])
    .dispatch({ type: "FETCH_EVENTS" })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`No event found

- No slot assignments occur`, async () => {
  const fakeResults = { value: [] }

  expectSaga(sagas)
    .provide([[matchers.call([api, api.get]), fakeResults]])
    .not.put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
      },
    })
    .dispatch({ type: "FETCH_EVENTS" })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`Assign guest slot to new events

- Fetching an event that has never been assigned will assign event to the next available slot and next available code
- Current guest wifi is assigned to the slot`, async () => {
  const fakeResults = {
    value: [
      {
        id: "123",
        subject: "Event title",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getPins), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "ASSIGN_GUEST_SLOT",
      payload: {
        title: "Event title",
        slotId: "slot1",
        eventId: "123",
        start: parseUtcToLocalDate(
          "2023-07-07T00:00:00.0000000",
          process.env.TZ ?? "EST",
        ),
        end: parseUtcToLocalDate(
          "2023-07-07T10:00:00.0000000",
          process.env.TZ ?? "EST",
        ),
        pin: "code1",
        timeZone: "Eastern Standard Time",
        guestNetwork: { ssid: "ssid", passPhrase: "pw" },
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`Existing assigned events

- Events are not assigned if the start, end, PIN, and guest network are the same
- Events with a different start, end, PIN, or guest network are assigned to a slot`, async () => {
  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "sameEventDetails",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), ["123"]],
      [matchers.select(getAvailableLockSlots), ["slot3"]],
      [
        matchers.select(getLockSlots),
        [
          [
            "slot1",
            {
              id: "slot1",
              eventId: "123",
              pin: "code3",
              start: new Date("2023-07-07T00:00:00.0000000"),
              end: new Date("2023-07-07T00:00:00.0000000"),
              guestNetwork: { ssid: "ssid", passPhrase: "pwp" },
            },
          ],
          [
            "slot2",
            {
              id: "slot2",
              eventId: "sameEventDetails",
              pin: "code4",
              start: new Date("2023-07-07T00:00:00.0000000"),
              end: new Date("2023-07-10T00:00:00.0000000"),
              guestNetwork: { ssid: "ssid", passPhrase: "pw" },
            },
          ],
        ],
      ],
      [matchers.select(getPins), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          pin: "code3",
          start: parseUtcToLocalDate(
            `2023-06-30T19:30:00.0000000`,
            process.env.TZ ?? "EST",
          ),
          end: parseUtcToLocalDate(
            `2023-06-30T19:30:00.0000000`,
            process.env.TZ ?? "EST",
          ),
          eventId: "123",
          slotId: "slot1",
          title: "Event title",
          guestNetwork: { ssid: "ssid", passPhrase: "pw" },
        },
      },
    })
    .not.put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          eventId: "sameEventDetails",
        },
      },
    })

    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`More events that available slots

- Slots will continue to be assigned to new events until there are no slots left
- Throw error once no slots are left`, async () => {
  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "event2",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1"]],
      [matchers.select(getPins), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          slotId: "slot1",
          eventId: "123",
          pin: "code1",
        },
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`More events than available codes

- Fetching more unassigned events than available codes will assign the remaining slots, dispatch to refill the available codes, and stop processing events`, async () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])

  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "event2",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getPins), ["code1"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          title: "Event title",
          slotId: "slot1",
          eventId: "123",
          pin: "code1",
        },
      },
    })
    .put({ type: "SET_PINS_IN_POOL", payload: ["code2"] })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`Removed events

- Removed events' guest slots are deallocated`, async () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])

  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getLockSlots),
        [
          [
            "slot1",
            {
              id: "slot1",
              eventId: "event2",
              pin: "code3",
            },
          ],
          ["slot2", null],
        ],
      ],
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), ["123", "event2"]],
      [matchers.select(getAvailableLockSlots), []],
      [matchers.select(getPins), []],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "FREE_SLOTS",
      payload: ["slot1"],
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`Completed events remove slots

- Events ending in the past have their slots deallocated`, async () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])
  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2022-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2022-07-07T03:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getLockSlots),
        [
          [
            "slot1",
            {
              id: "slot1",
              eventId: "event2",
              pin: "code3",
            },
          ],
          ["slot2", null],
        ],
      ],
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getPins), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "FREE_SLOTS",
      payload: ["slot1"],
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`Completed events are ignored for assignment

- Fetched events that have already passed are excluded from those assigned to a guest slot`, async () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])

  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2022-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2022-07-07T01:01:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "event2",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2022-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2022-07-07T01:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getPins), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .not.put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          eventId: "event2",
        },
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})

test(`Event times are converted to local time zone

- Fetched event times are converted to local time zone`, async () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])
  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: `2023-06-30T19:30:00.0000000`,
          timeZone: "UTC",
        },
        end: {
          dateTime: `2023-06-30T19:35:00.0000000`,
          timeZone: "UTC",
        },
      },
    ],
  }

  expectSaga(sagas)
    .provide([
      [
        matchers.select(getGuestWifiNetwork),
        { ssid: "ssid", passPhrase: "pw" },
      ],
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getPins), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          start: parseUtcToLocalDate(
            `2023-06-30T19:30:00.0000000`,
            process.env.TZ ?? "EST",
          ),
          end: parseUtcToLocalDate(
            `2023-06-30T19:35:00.0000000`,
            process.env.TZ ?? "EST",
          ),
          timeZone: "Eastern Standard Time",
        },
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
  jest.advanceTimersByTime(100)
  await Promise.resolve()
})
