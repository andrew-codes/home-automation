jest.mock("../graphClient")
jest.mock("../candidateCodes")
import { when } from "jest-when"
import { expectSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"
import { throwError } from "redux-saga-test-plan/providers"
import graphClient from "../graphClient"
import reducer from "../reducer"
import sagas from "../sagas"
import { getAvailablePins, getEvents } from "../selectors"

let api
const calendarId = "cal_id"
let fetchEventsAction
beforeEach(() => {
  jest.resetAllMocks()

  const client = {
    api: jest.fn(),
  }
  ;(graphClient as jest.Mock).mockReturnValue(client)

  api = { get: jest.fn() }
  when(client.api)
    .calledWith(`/users/${calendarId}/events`)
    .mockReturnValue(api)
})

beforeEach(() => {
  fetchEventsAction = {
    type: "EVENT/FETCH",
    payload: {
      calendarId,
    },
  }
})

test("Network errors do not crash saga", () => {
  const error = new Error("error")
  return expectSaga(sagas)
    .provide([[matchers.call([api, api.get]), throwError(error)]])
    .put({ type: "ERROR", payload: { error: error } })
    .dispatch(fetchEventsAction)
    .run()
})

test(`No event found

- No slot assignments occur`, () => {
  const fakeResults = { value: [] }

  return expectSaga(sagas)
    .provide([[matchers.call([api, api.get]), fakeResults]])
    .not.put.like({
      action: {
        type: "EVENT/TITLE_CHANGE",
      },
    })
    .not.put.like({
      action: {
        type: "EVENT/TIME_CHANGE",
      },
    })
    .not.put.like({
      action: {
        type: "EVENT/NEW",
      },
    })
    .dispatch(fetchEventsAction)
    .run()
})

test(`Assign guest slot to new events only.

- Events are considered new if they do not exist in the store; as matched by event ID and calendar ID.
- 
- New events are assigned an unassigned PIN.
`, () => {
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
      {
        id: "897",
        subject: "Event title 3",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        start: {
          dateTime: "2023-09-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-09-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "456",
        subject: "Event title 2",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        start: {
          dateTime: "2023-08-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-08-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
    ],
  }

  return expectSaga(sagas)
    .provide([
      [matchers.select(getEvents), [{ eventId: "897", calendarId: "cal_id" }]],
      [matchers.select(getAvailablePins), ["1234", "5678"]],
      [matchers.call([api, api.get]), fakeResults],
    ])
    .put({
      type: "EVENT/NEW",
      payload: {
        calendarId: "cal_id",
        title: "Event title",
        eventId: "123",
        start: "2023-07-07T00:00:00.0000000",
        end: "2023-07-10T00:00:00.0000000",
        pin: "1234",
      },
    })
    .put({
      type: "EVENT/NEW",
      payload: {
        calendarId: "cal_id",
        title: "Event title 2",
        eventId: "456",
        start: "2023-08-07T00:00:00.0000000",
        end: "2023-08-10T00:00:00.0000000",
        pin: "5678",
      },
    })
    .dispatch(fetchEventsAction)
    .run()
})

test(`Existing assigned events are updated with latest event information.

- Events existing if they match an event in the store by eventId and calendarId.
- Existing events with different titles will have their titles updated.
- Existing events with different dates will have their start and end dates updated.`, () => {
  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title (updated)",
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
        id: "456",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-08-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-08-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "897",
        subject: "New event",
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
  const knownEvents = [
    { eventId: "123", calendarId: "cal_id", title: "Event title" },
    { eventId: "456", calendarId: "cal_id" },
  ]

  return expectSaga(sagas)
    .provide([
      [matchers.call([api, api.get]), fakeResults],
      [matchers.select(getEvents), knownEvents],
      [matchers.select(getAvailablePins), ["5698"]],
    ])
    .put.like({
      action: {
        type: "EVENT/TITLE_CHANGE",
        payload: {
          calendarId: "cal_id",
          eventId: "123",
          title: "Event title (updated)",
        },
      },
    })
    .put.like({
      action: {
        type: "EVENT/TIME_CHANGE",
        payload: {
          calendarId: "cal_id",
          eventId: "456",
          start: "2023-08-07T00:00:00.0000000",
          end: "2023-08-10T00:00:00.0000000",
        },
      },
    })
    .dispatch(fetchEventsAction)
    .run()
})

test("Events update actions are dispatched before new event actions.", () => {
  const fakeResults = {
    value: [
      {
        id: "123",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title (updated)",
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
        id: "456",
        originalStartTimeZone: "Eastern Standard Time",
        originalEndTimeZone: "Eastern Standard Time",
        subject: "Event title",
        start: {
          dateTime: "2023-08-07T00:00:00.0000000",
          timeZone: "UTC",
        },
        end: {
          dateTime: "2023-08-10T00:00:00.0000000",
          timeZone: "UTC",
        },
      },
      {
        id: "897",
        subject: "New event",
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
  const knownEvents = [
    { eventId: "123", calendarId: "cal_id", title: "Event title" },
    { eventId: "456", calendarId: "cal_id" },
  ]

  return expectSaga(sagas)
    .withReducer(reducer)
    .provide([
      [matchers.call([api, api.get]), fakeResults],
      [matchers.select(getEvents), knownEvents],
      [matchers.select(getAvailablePins), ["5698"]],
    ])
    .dispatch(fetchEventsAction)
    .hasFinalState({
      pins: [],
      doorLocks: [],
      guestSlots: {},
      events: {
        "cal_id:123": {
          calendarId: "cal_id",
          eventId: "123",
          title: "Event title (updated)",
          start: "2023-07-07T00:00:00.0000000",
          end: "2023-07-10T00:00:00.0000000",
        },
        "cal_id:456": {
          calendarId: "cal_id",
          eventId: "456",
          title: "Event title",
          start: "2023-08-07T00:00:00.0000000",
          end: "2023-08-10T00:00:00.0000000",
        },
        "cal_id:897": {
          pin: "5698",
          calendarId: "cal_id",
          eventId: "897",
          title: "New event",
          start: "2023-07-07T00:00:00.0000000",
          end: "2023-07-10T00:00:00.0000000",
        },
      },
    })
    .run()
})
