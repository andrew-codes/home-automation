jest.mock("../dbClient")
jest.mock("@ha/mqtt-client")
import { createMqtt } from "@ha/mqtt-client"
import { expectSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"
import { throwError } from "redux-saga-test-plan/providers"
import getClient from "../dbClient"
import sagas from "../sagas"

let action
const eventId = "123"
const calendarId = "cal_id"
let guestEvents
const publish = jest.fn()
beforeEach(() => {
  jest.resetAllMocks()
  guestEvents = { deleteOne: jest.fn() }
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
  action = {
    type: "EVENT/REMOVE",
    payload: {
      calendarId,
      eventId,
    },
  }
})

test("Errors do not crash saga", () => {
  const error = new Error("error")
  return expectSaga(sagas)
    .provide([
      [
        matchers.call([guestEvents, guestEvents.deleteOne], {
          id: `${calendarId}:${eventId}`,
        }),
        throwError(error),
      ],
    ])
    .put({ type: "ERROR", payload: { error } })
    .dispatch(action)
    .run()
})

test(`Removed event is deleted from persistence.`, () => {
  return expectSaga(sagas)
    .dispatch(action)
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
            fn: guestEvents.deleteOne,
            args: expect.arrayContaining([
              {
                id: `${calendarId}:${eventId}`,
              },
            ]),
          }),
        }),
      )
    })
})

test(`Removed event slot is deleted from persistence.`, () => {
  return expectSaga(sagas)
    .dispatch(action)
    .run()
    .then(async (result) => {
      const client = await getClient()
      expect(client.db).toHaveBeenCalledWith("guests")
      expect(client.db().collection).toHaveBeenCalledWith("slots")

      const { allEffects } = result
      expect(allEffects).toContainEqual(
        expect.objectContaining({
          type: "CALL",
          payload: expect.objectContaining({
            fn: guestEvents.deleteOne,
            args: expect.arrayContaining([
              {
                calendarId,
                eventId,
              },
            ]),
          }),
        }),
      )
    })
})
