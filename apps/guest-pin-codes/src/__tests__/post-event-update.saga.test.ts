jest.mock("../graphClient")
// jest.mock("../CalendarInviteBody", () => ({ default: jest.fn() }))
// jest.mock("react-dom/server")
// jest.mock("react")
import { when } from "jest-when"
import { expectSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"
import { throwError } from "redux-saga-test-plan/providers"
import graphClient from "../graphClient"
// import { renderToString } from "react-dom/server"
import sagas from "../sagas"
import { getGuestWifiNetwork } from "../selectors"

let api
const eventId = "123"
beforeEach(() => {
  jest.resetAllMocks()
  process.env.GUEST_PIN_CODES_CALENDAR_ID = "cal_id"
  const client = {
    api: jest.fn(),
  }
  ;(graphClient as jest.Mock).mockReturnValue(client)

  api = { patch: jest.fn() }
  when(client.api)
    .calledWith(`/users/cal_id/events/${eventId}`)
    .mockReturnValue(api)
})

test("Network errors do not crash saga", async () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [
        matchers.call.like({ context: api, fn: api.patch }),
        throwError(new Error("API Error")),
      ],
    ])
    .call.like({ context: api, fn: api.patch })
    .dispatch({
      type: "POST_EVENT_UPDATE",
      payload: { eventId, pin: "code1" },
    })
    .run()
})

test(`Update events with assigned code

- Updates calendar event description to include the assigned code`, () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [matchers.call.like({ context: api, fn: api.patch }), {}],
    ])
    .dispatch({
      type: "POST_EVENT_UPDATE",
      payload: { eventId, pin: "code1" },
    })
    .run()
    .then((result) => {
      const { allEffects } = result

      expect(allEffects[allEffects.length - 2]).toMatchObject({
        payload: {
          args: expect.arrayContaining([
            {
              body: {
                contentType: "html",
                content: expect.stringContaining("code1"),
              },
            },
          ]),
        },
      })
    })
})

test(`Events without an assigned code

- Updates calendar event description indicating that an access code will be provided sooner to the event`, () => {
  return expectSaga(sagas)
    .provide([
      [matchers.select(getGuestWifiNetwork), { ssid: "1", passPhrase: "2" }],
      [matchers.call.like({ context: api, fn: api.patch }), {}],
    ])
    .dispatch({
      type: "POST_EVENT_UPDATE",
      payload: { eventId },
    })
    .run()
    .then((result) => {
      const { allEffects } = result

      expect(allEffects[allEffects.length - 2]).toMatchObject({
        payload: {
          args: expect.arrayContaining([
            {
              body: {
                contentType: "html",
                content: expect.stringContaining(
                  "The access code will be provided closer to the event.",
                ),
              },
            },
          ]),
        },
      })
    })
})