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
import { getGuestWifiNetwork } from "../selectors"

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
    .then(async (result) => {
      const client = await getClient()
      expect(client.db).toHaveBeenCalledWith("guests")
      expect(client.db().collection).toHaveBeenCalledWith("events")

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
