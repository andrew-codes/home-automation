jest.mock("../graphClient")
jest.mock("../candidateCodes")
// import { createMqtt } from "@ha/mqtt-client"
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
} from "../selectors"
import candidateCodes from "../candidateCodes"

let mqtt = {
  publish: jest.fn(),
}

let client
beforeEach(() => {
  jest.resetAllMocks()
  process.env.GUEST_PIN_CODES_CALENDAR_ID = "cal_id"
  client = {
    api: jest.fn(),
  }
})

describe("fetching events", () => {
  test("Network errors do not crash saga", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })

    return expectSaga(sagas)
      .provide([
        [matchers.call.fn(getEvents), throwError(new Error("Google Error"))],
      ])
      .dispatch({ type: "FETCH_EVENTS", payload: new Date() })
      .run()
  })

  test("successfully, but with no events", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })

    const fakeResults = { value: [] }
    return expectSaga(sagas)
      .provide([[matchers.call.fn(getEvents), fakeResults]])
      .not.put({
        type: "ASSIGN_GUEST_SLOT",
        payload: expect.anything(),
      })
      .dispatch({ type: "FETCH_EVENTS", payload: new Date() })
      .run()
  })

  test("fetching an event that has never been assigned will assign event to the next available slot and next available code", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })

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
        [matchers.call.fn(getEvents), fakeResults],
      ])
      .put({
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          slotId: "slot1",
          eventId: "123",
          start: new Date("2023-07-07T00:00:00.0000000"),
          end: new Date("2023-07-10T00:00:00.0000000"),
          code: "code1",
        },
      })
      .dispatch({
        type: "FETCH_EVENTS",
        payload: { start: new Date(), end: new Date() },
      })
      .run()
  })

  test("fetching events that have already been assigned a slot will not attempt to assign the slot to the event again", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })

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
        [matchers.select(getAvailableLockSlots), ["slot1", "slot2"]],
        [matchers.select(getCodes), ["code1", "code2"]],
        [matchers.call.fn(getEvents), fakeResults],
      ])
      .not.put({
        type: "ASSIGN_GUEST_SLOT",
        payload: expect.anything(),
      })
      .dispatch({
        type: "FETCH_EVENTS",
        payload: { start: new Date(), end: new Date() },
      })
      .run()
  })

  test("fetching more unassigned events than slots will assign the remaining slots and throw an error as soon as no slots are left", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })

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
        [matchers.call.fn(getEvents), fakeResults],
      ])
      .put({
        type: "ASSIGN_GUEST_SLOT",
        payload: {
          slotId: "slot1",
          eventId: "123",
          start: new Date("2023-07-07T00:00:00.0000000"),
          end: new Date("2023-07-10T00:00:00.0000000"),
          code: "code1",
        },
      })
      .dispatch({
        type: "FETCH_EVENTS",
        payload: { start: new Date(), end: new Date() },
      })
      .run()
  })

  test("fetching more unassigned events than available codes will assign the remaining slots, dispatch to refill the available codes, and stop processing events", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })
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
        [matchers.call.fn(getEvents), fakeResults],
      ])
      .put({
        type: "ASSIGN_GUEST_SLOT",
        payload: {
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
        payload: { start: new Date(), end: new Date() },
      })
      .run()
  })

  test("all fetched events attempt to clean out removed or complete guest slots", () => {
    ;(graphClient as jest.Mock).mockReturnValue(client)
    const getEvents = jest.fn()
    when(client.api)
      .calledWith("groups/cal_id/events")
      .mockReturnValue({ get: getEvents })
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
        [matchers.select(getAvailableLockSlots), []],
        [matchers.select(getCodes), []],
        [matchers.call.fn(getEvents), fakeResults],
      ])
      .put({
        type: "ATTEMPT_TO_FREE_SLOTS",
        payload: ["123", "event2"],
      })
      .dispatch({
        type: "FETCH_EVENTS",
        payload: { start: new Date(), end: new Date() },
      })
      .run()
  })
})
