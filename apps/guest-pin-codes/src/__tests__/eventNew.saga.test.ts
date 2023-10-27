jest.mock("../graphClient")
jest.mock("../dbClient")
jest.mock("@ha/mqtt-client")
import { createMqtt } from "@ha/mqtt-client"
import { when } from "jest-when"
import { expectSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"
import { throwError } from "redux-saga-test-plan/providers"
import getClient from "../dbClient"
import graphClient from "../graphClient"
import sagas from "../sagas"
import { getCandidateSlots, getEvents, getGuestWifiNetwork } from "../selectors"

let api
let newEventAction
const eventId = "123"
const calendarId = "cal_id"
let guestEvents
const publish = jest.fn()
beforeEach(() => {
  jest.resetAllMocks()
  const client = {
    api: jest.fn(),
  }
  ;(graphClient as jest.Mock).mockReturnValue(client)

  api = { patch: jest.fn() }
  when(client.api)
    .calledWith(`/users/${calendarId}/events/${eventId}`)
    .mockReturnValue(api)

  guestEvents = {
    updateOne: jest.fn(),
  }
  ;(getClient as jest.Mock).mockResolvedValue({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue(guestEvents),
    }),
  })
  ;(createMqtt as jest.Mock).mockResolvedValue({
    publish,
  })
})

beforeEach(() => {
  newEventAction = {
    type: "EVENT/NEW",
    payload: {
      calendarId,
      eventId,
      pin: "1234",
      title: "New Event",
      start: "2023-07-07T00:00:00.0000000",
      end: "2023-07-08T00:00:00.0000000",
    },
  }
})

test("Errors do not crash saga", () => {
  const error = new Error("Error")

  return expectSaga(sagas)
    .provide([[matchers.select(getGuestWifiNetwork), throwError(error)]])
    .put({ type: "ERROR", payload: { error: error } })
    .dispatch(newEventAction)
    .run()
})

test(`New events update the calendar invite with their PIN.`, () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [matchers.call.like({ context: api, fn: api.patch }), {}],
    ])
    .dispatch(newEventAction)
    .run()
    .then((result) => {
      const { allEffects } = result

      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            fn: api.patch,
            args: expect.arrayContaining([
              {
                body: {
                  contentType: "html",
                  content: expect.stringContaining("1234"),
                },
              },
            ]),
          }),
        }),
      )
    })
})

test(`New events are persisted.`, () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [matchers.call.like({ context: api, fn: api.patch }), {}],
    ])
    .dispatch(newEventAction)
    .run()
    .then((result) => {
      const { allEffects } = result

      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            fn: guestEvents.updateOne,
            args: expect.arrayContaining([
              {
                id: `${calendarId}:${eventId}`,
              },
              {
                $set: expect.objectContaining({
                  id: `${calendarId}:${eventId}`,
                  ...newEventAction.payload,
                }),
              },
              { upsert: true },
            ]),
          }),
        }),
      )
    })
})

test(`MQTT message for slot assignment is the first known event when its start is before the new event's start.`, () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [matchers.call.like({ context: api, fn: api.patch }), {}],
      [matchers.select(getCandidateSlots), [{ id: 1 }]],
      [
        matchers.select(getEvents),
        [
          {
            start: "2022-07-06T00:00:00.0000000",
            end: "2023-07-06T00:00:00.0000000",
            pin: "4567",
            title: "Earlier event",
          },
        ],
      ],
    ])
    .dispatch(newEventAction)
    .run()
    .then((result) => {
      const { allEffects } = result

      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"pin":"4567"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"title":"Earlier event"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"slotId":1'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"start":"2022-07-06T00:00:00.0000000"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"end":"2023-07-06T00:00:00.0000000"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
    })
})

test(`MQTT message for slot assignment is the new event when its start is before the first known event's start.`, () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [matchers.call.like({ context: api, fn: api.patch }), {}],
      [matchers.select(getCandidateSlots), [{ id: 1 }]],
      [
        matchers.select(getEvents),
        [
          {
            start: "2024-07-06T00:00:00.0000000",
            end: "2024-07-06T00:00:00.0000000",
            pin: "4567",
            title: "Earlier event",
          },
        ],
      ],
    ])
    .dispatch(newEventAction)
    .run()
    .then((result) => {
      const { allEffects } = result

      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"pin":"1234"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"title":"New Event"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"slotId":1'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"start":"2023-07-07T00:00:00.0000000"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            args: expect.arrayContaining([
              `guest/slot/1/set`,
              expect.stringContaining('"end":"2023-07-08T00:00:00.0000000"'),
              { qos: 1 },
            ]),
          }),
        }),
      )
    })
})
