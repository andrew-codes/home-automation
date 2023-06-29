// import { createMqtt } from "@ha/mqtt-client"
import { expectSaga } from "redux-saga-test-plan"
import { throwError } from "redux-saga-test-plan/providers"
import * as matchers from "redux-saga-test-plan/matchers"
import sagas from "../sagas"
// import { call, select } from "redux-saga/effects"

const calendarClient = {
  events: {
    list: jest.fn(),
    update: jest.fn(),
  },
}
let mqtt = {
  publish: jest.fn(),
}

beforeEach(() => {
  jest.resetAllMocks()
  process.env.GUEST_PIN_CODES_CALENDAR_ID = "cal_id"
})

describe.skip("fetching events", () => {
  test("with error does not crash saga", () => {
    return expectSaga(sagas)
      .provide([
        [
          matchers.call.fn(calendarClient.events.list),
          throwError(new Error("Google Error")),
        ],
      ])
      .dispatch({ type: "FETCH_EVENTS", payload: new Date() })
      .run()
  })

  test("successfully, but with no events", () => {
    const fakeResults = { data: { items: null } }
    return expectSaga(sagas)
      .provide([[matchers.call.fn(calendarClient.events.list), fakeResults]])
      .put({
        type: "SET_EVENTS",
        payload: [],
      })
      .dispatch({ type: "FETCH_EVENTS", payload: new Date() })
      .run()
  })

  test("successfully, with events", () => {
    const fakeResults = {
      data: {
        items: [
          {
            id: "1",
          },
        ],
      },
    }
    return expectSaga(sagas)
      .provide([[matchers.call.fn(calendarClient.events.list), fakeResults]])
      .put({
        type: "SET_EVENTS",
        payload: [
          {
            id: "1",
          },
        ],
      })
      .dispatch({ type: "FETCH_EVENTS", payload: new Date() })
      .run()
  })
})
