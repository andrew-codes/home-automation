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
  getCodes,
  getLockSlots,
} from "../selectors"
import candidateCodes from "../candidateCodes"

let api
beforeEach(() => {
  jest.resetAllMocks()
  process.env.GUEST_PIN_CODES_CALENDAR_ID = "cal_id"
  const client = {
    api: jest.fn(),
  }
  ;(graphClient as jest.Mock).mockReturnValue(client)

  api = { get: jest.fn() }
  when(client.api).calledWith("/users/cal_id/events").mockReturnValue(api)
})

test("Network errors do not crash saga", () => {
  return expectSaga(sagas)
    .provide([
      [matchers.call([api, api.get]), throwError(new Error("API Error"))],
    ])
    .call([api, api.get])
    .dispatch({ type: "FETCH_EVENTS" })
    .run()
})

test(`No event found

- No slot assignments occur`, () => {
  const fakeResults = { value: [] }

  return expectSaga(sagas)
    .provide([[matchers.call([api, api.get]), fakeResults]])
    .not.put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
      },
    })
    .dispatch({ type: "FETCH_EVENTS" })
    .run()
})

test(`Assign guest slot to new events

- Fetching an event that has never been assigned will assign event to the next available slot and next available code`, () => {
  const fakeResults = {
    value: [
      {
        id: "123",
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

  return expectSaga(sagas)
    .provide([
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getCodes), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "ASSIGN_GUEST_SLOT",
      payload: {
        title: "Event title",
        slotId: "slot1",
        eventId: "123",
        start: new Date("2023-07-07T00:00:00.0000000"),
        end: new Date("2023-07-10T00:00:00.0000000"),
        code: "code1",
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
})

test(`Assign guest slot to existing events

- Fetched events that have already been assigned a slot will assign the slot with the previously assigned code`, () => {
  const fakeResults = {
    value: [
      {
        id: "123",
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

  return expectSaga(sagas)
    .provide([
      [matchers.select(getAlreadyAssignedEventIds), ["123"]],
      [matchers.select(getAvailableLockSlots), ["slot2"]],
      [
        matchers.select(getLockSlots),
        [
          [
            "slot1",
            {
              id: "slot1",
              eventId: "123",
              code: "code3",
            },
          ],
          ["slot2", null],
        ],
      ],
      [matchers.select(getCodes), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          code: "code3",
          end: new Date("2023-07-10T00:00:00.0000000"),
          eventId: "123",
          slotId: "slot1",
          start: new Date("2023-07-07T00:00:00.0000000"),
          title: "Event title",
        },
      },
    })

    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
})

test(`More events that available slots

- Slots will continue to be assigned to new events until there are no slots left
- Throw error once no slots are left`, () => {
  const fakeResults = {
    value: [
      {
        id: "123",
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

  return expectSaga(sagas)
    .provide([
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1"]],
      [matchers.select(getCodes), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "ASSIGN_GUEST_SLOT",
      payload: {
        title: "Event title",
        slotId: "slot1",
        eventId: "123",
        start: new Date("2023-07-07T00:00:00.0000000"),
        end: new Date("2023-07-10T00:00:00.0000000"),
        code: "code1",
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
})

test(`More events than available codes

- Fetching more unassigned events than available codes will assign the remaining slots, dispatch to refill the available codes, and stop processing events`, () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])

  const fakeResults = {
    value: [
      {
        id: "123",
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

  return expectSaga(sagas)
    .provide([
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getCodes), ["code1"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "ASSIGN_GUEST_SLOT",
      payload: {
        title: "Event title",
        slotId: "slot1",
        eventId: "123",
        start: new Date("2023-07-07T00:00:00.0000000"),
        end: new Date("2023-07-10T00:00:00.0000000"),
        code: "code1",
      },
    })
    .put({ type: "SET_CODES_IN_POOL", payload: ["code2"] })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
})

test(`Removed events

- Removed events' guest slots are deallocated`, () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])

  const fakeResults = {
    value: [
      {
        id: "123",
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

  return expectSaga(sagas)
    .provide([
      [
        matchers.select(getLockSlots),
        [
          [
            "slot1",
            {
              id: "slot1",
              eventId: "event2",
              code: "code3",
            },
          ],
          ["slot2", null],
        ],
      ],
      [matchers.select(getAlreadyAssignedEventIds), ["123", "event2"]],
      [matchers.select(getAvailableLockSlots), []],
      [matchers.select(getCodes), []],
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
})

test(`Completed events remove slots

- Events ending in the past have heir slots deallocated`, () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])
  const future = new Date()
  future.setFullYear(future.getFullYear() + 1)

  const fakeResults = {
    value: [
      {
        id: "123",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: future.toUTCString(),
          timeZone: "UTC",
        },
      },
      {
        id: "event2",
        subject: "Event title",
        start: {
          dateTime: "2022-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2022-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  return expectSaga(sagas)
    .provide([
      [
        matchers.select(getLockSlots),
        [
          [
            "slot1",
            {
              id: "slot1",
              eventId: "event2",
              code: "code3",
            },
          ],
          ["slot2", null],
        ],
      ],
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getCodes), ["code1", "code2"]],
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
})

test(`Completed events are ignored for assignment

- Fetched events that have already passed are excluded from those assigned to a guest slot`, () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])
  const future = new Date()
  future.setFullYear(future.getFullYear() + 1)

  const fakeResults = {
    value: [
      {
        id: "123",
        subject: "Event title",
        start: {
          dateTime: "2023-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: future.toUTCString(),
          timeZone: "UTC",
        },
      },
      {
        id: "event2",
        subject: "Event title",
        start: {
          dateTime: "2022-07-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2022-07-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  return expectSaga(sagas)
    .provide([
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getCodes), ["code1", "code2"]],
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
})

test(`Event times are converted to local time zone

- Fetched event times are converted to local time zone`, () => {
  ;(candidateCodes as jest.Mock).mockReturnValue(["code1", "code2"])
  const futureYear = new Date().getFullYear() + 1
  const fakeResults = {
    value: [
      {
        id: "123",
        subject: "Event title",
        start: {
          dateTime: `${futureYear}-06-30T19:30:00.0000000`,
          timeZone: "UTC",
        },
        end: {
          dateTime: `${futureYear}-06-30T19:35:00.0000000`,
          timeZone: "UTC",
        },
      },
    ],
  }

  return expectSaga(sagas)
    .provide([
      [matchers.select(getAlreadyAssignedEventIds), []],
      [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
      [matchers.select(getCodes), ["code1", "code2"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put.like({
      action: {
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          start: new Date(futureYear, 5, 30, 3, 30),
          end: new Date(futureYear, 5, 30, 3, 35),
        },
      },
    })
    .dispatch({
      type: "FETCH_EVENTS",
    })
    .run()
})
