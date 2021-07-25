jest.mock("../googleClient")
import { expectSaga } from "redux-saga-test-plan"
import { throwError } from "redux-saga-test-plan/providers"
import * as matchers from "redux-saga-test-plan/matchers"
import sagas from "../sagas"
import { createCalendarClient } from "../googleClient"
import { call, select } from "redux-saga/effects"
import { assignedGuestSlot, setEvents } from "../actionCreators"
import {
  getAvailableLockSlots,
  getCodes,
  getCurrentCodeIndex,
  getDoorLocks,
  getEndingEvents,
  getLockSlots,
  getStartingEvents,
} from "../selectors"
import createMqttClient from "../mqtt"

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
  ;(createCalendarClient as jest.Mock).mockReturnValue(calendarClient)
  process.env.GOOGLE_CALENDAR_ID = "cal_id"
})

describe("fetching events", () => {
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

describe("starting events", () => {
  test("general errors do not crash the saga", () => {
    const startingEvents = []
    return expectSaga(sagas)
      .provide([[select(getStartingEvents), throwError(new Error("error"))]])
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .not.call.fn(calendarClient.events.update)
      .run()
  })

  test("google calendar update or mqtt errors do not crash the saga", () => {
    const startingEvents = [{ id: "1" }]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), startingEvents],
        [select(getCodes), ["0002", "0001", "0003"]],
        [select(getDoorLocks), ["front_door"]],
        [select(getCurrentCodeIndex), 1],
        [select(getAvailableLockSlots), ["1", "2", "3"]],
        [
          matchers.call.fn(calendarClient.events.update),
          throwError(new Error("500")),
        ],
        [call(createMqttClient), mqtt],
      ])
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .run()
  })

  test("with no starting events", () => {
    const startingEvents = []
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), startingEvents],
        [select(getCodes), ["0002", "0001"]],
        [select(getDoorLocks), ["front_door"]],
        [select(getCurrentCodeIndex), 1],
      ])
      .put({
        type: "LAST_USED_CODE",
        payload: "0001",
      })
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .not.call.fn(calendarClient.events.update)
      .run()
  })

  test("with starting events, but no available code slots", () => {
    const startingEvents = [
      { id: "1", sequence: 0 },
      { id: "2", sequence: 0 },
      { id: "3", sequence: 0 },
    ]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), startingEvents],
        [select(getCodes), ["0002", "0001"]],
        [select(getDoorLocks), ["front_door"]],
        [select(getCurrentCodeIndex), 1],
        [select(getAvailableLockSlots), []],
      ])
      .put({
        type: "LAST_USED_CODE",
        payload: "0001",
      })
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .not.call.fn(calendarClient.events.update)
      .run()
  })

  test("with starting events and available code slots, more events than remaining codes will reset to start at the beginning of the codes collection", () => {
    const startingEvents = [
      { id: "1", sequence: 0 },
      { id: "2", sequence: 0 },
      { id: "3", sequence: 0 },
    ]
    return (
      expectSaga(sagas)
        .provide([
          [select(getStartingEvents), startingEvents],
          [select(getCodes), ["0002", "0001", "0003"]],
          [select(getDoorLocks), ["front_door"]],
          [select(getCurrentCodeIndex), 1],
          [select(getAvailableLockSlots), ["1", "2", "3"]],
          [call(createMqttClient), mqtt],
        ])
        .put({
          type: "LAST_USED_CODE",
          payload: "0001",
        })
        .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
        // .call.like({ fn: calendarClient.events.update })
        .run()
    )
  })

  test("with starting events and available code slots, each event on Google Calendar is updated with the next access code", () => {
    const startingEvents = [
      { id: "1", sequence: 0 },
      { id: "2", sequence: 0 },
      { id: "3", sequence: 0 },
    ]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), startingEvents],
        [select(getCodes), ["0002", "0001", "0003"]],
        [select(getDoorLocks), ["front_door"]],
        [select(getCurrentCodeIndex), 0],
        [select(getAvailableLockSlots), ["1", "2", "3"]],
        [call(createMqttClient), mqtt],
      ])
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .call.like({
        fn: calendarClient.events.update,
        args: [
          {
            calendarId: "cal_id",
            eventId: "1",
            sendUpdates: "all",
            requestBody: {
              sequence: 1,
              description: `ACCESS CODE: 0001
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew or Dorri

Thank you!`,
            },
          },
        ],
      })
      .call.like({
        fn: calendarClient.events.update,
        args: [
          {
            calendarId: "cal_id",
            eventId: "2",
            sendUpdates: "all",
            requestBody: {
              sequence: 1,
              description: `ACCESS CODE: 0003
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew or Dorri

Thank you!`,
            },
          },
        ],
      })
      .call.like({
        fn: calendarClient.events.update,
        args: [
          {
            calendarId: "cal_id",
            eventId: "3",
            sendUpdates: "all",
            requestBody: {
              sequence: 1,
              description: `ACCESS CODE: 0002
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew or Dorri

Thank you!`,
            },
          },
        ],
      })
      .run()
  })

  test("with starting events and available code slots, topics are published to enable and set each event's code for each door lock", () => {
    const startingEvents = [
      { id: "1", sequence: 0 },
      { id: "2", sequence: 0 },
    ]
    return (
      expectSaga(sagas)
        .provide([
          [select(getStartingEvents), startingEvents],
          [select(getCodes), ["0002", "0001", "0003"]],
          [select(getDoorLocks), ["front_door", "car_port_door"]],
          [select(getCurrentCodeIndex), 0],
          [select(getAvailableLockSlots), ["1", "2", "3"]],
          [call(createMqttClient), mqtt],
        ])
        .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
        // Event 1
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/set",
            JSON.stringify({
              entity_id: "input_text.front_door_pin_1",
              pin: "0001",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/set",
            JSON.stringify({
              entity_id: "input_text.car_port_door_pin_1",
              pin: "0001",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/enable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_front_door_1",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/enable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_car_port_door_1",
            }),
            { qos: 2 },
          ],
        })
        // Event 2
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/set",
            JSON.stringify({
              entity_id: "input_text.front_door_pin_2",
              pin: "0003",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/set",
            JSON.stringify({
              entity_id: "input_text.car_port_door_pin_2",
              pin: "0003",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/enable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_front_door_2",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/enable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_car_port_door_2",
            }),
            { qos: 2 },
          ],
        })
        .run()
    )
  })

  test("with starting events and available code slots, assigns each event to a code slot", () => {
    const startingEvents = [
      { id: "1", sequence: 0 },
      { id: "2", sequence: 0 },
    ]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), startingEvents],
        [select(getCodes), ["0002", "0001", "0003"]],
        [select(getDoorLocks), ["front_door", "car_port_door"]],
        [select(getCurrentCodeIndex), 0],
        [select(getAvailableLockSlots), ["1", "2", "3"]],
        [call(createMqttClient), mqtt],
      ])
      .put(assignedGuestSlot("1", "1"))
      .put(assignedGuestSlot("2", "2"))
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .run()
  })

  test("with starting events and not enough available code slots, assigns as many events to code slots as possible", () => {
    const startingEvents = [
      { id: "1", sequence: 0 },
      { id: "2", sequence: 0 },
    ]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), startingEvents],
        [select(getCodes), ["0002", "0001", "0003"]],
        [select(getDoorLocks), ["front_door", "car_port_door"]],
        [select(getCurrentCodeIndex), 0],
        [select(getAvailableLockSlots), ["1"]],
        [call(createMqttClient), mqtt],
      ])
      .put(assignedGuestSlot("1", "1"))
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .run()
  })
})

describe("ending events", () => {
  test("errors do not crash saga", () => {
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), []],
        [select(getEndingEvents), throwError(new Error("error"))],
        [select(getCodes), ["0002", "0001", "0003"]],
        [select(getDoorLocks), ["front_door", "car_port_door"]],
        [select(getCurrentCodeIndex), 0],
        [select(getAvailableLockSlots), ["1"]],
        [call(createMqttClient), mqtt],
      ])
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .not.call.fn(mqtt.publish)
      .run()
  })

  test("with no events ending now", () => {
    const endingEvents = []
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), []],
        [select(getEndingEvents), endingEvents],
        [select(getCodes), ["0002", "0001", "0003"]],
        [select(getDoorLocks), ["front_door", "car_port_door"]],
        [select(getCurrentCodeIndex), 0],
        [select(getAvailableLockSlots), ["1"]],
        [call(createMqttClient), mqtt],
      ])
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .not.call.fn(mqtt.publish)
      .run()
  })

  test("with ending events and with events not recorded to a slot, ignores the events without a slot", () => {
    const event1Id = "1"
    const event2Id = "2"
    const endingEvents = [
      { id: event1Id, sequence: 0 },
      { id: event2Id, sequence: 0 },
    ]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), []],
        [select(getEndingEvents), endingEvents],
        [select(getLockSlots), []],
        [select(getDoorLocks), []],
        [call(createMqttClient), mqtt],
      ])
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .not.call.fn(mqtt.publish)
      .run()
  })

  test("with ending events, unassign code slot for each ending event", () => {
    const event1Id = "1"
    const event2Id = "2"
    const endingEvents = [
      { id: event1Id, sequence: 0 },
      { id: event2Id, sequence: 0 },
    ]
    return expectSaga(sagas)
      .provide([
        [select(getStartingEvents), []],
        [select(getEndingEvents), endingEvents],
        [
          select(getLockSlots),
          [
            ["2", event1Id],
            ["3", event2Id],
          ],
        ],
        [select(getDoorLocks), []],
        [call(createMqttClient), mqtt],
      ])
      .put({
        type: "ASSIGNED_GUEST_SLOT",
        payload: { id: "2", eventId: null },
      })
      .put({
        type: "ASSIGNED_GUEST_SLOT",
        payload: { id: "3", eventId: null },
      })
      .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
      .run()
  })

  test("with ending events, disable each event's code for each door", () => {
    const event1Id = "1"
    const event2Id = "2"
    const endingEvents = [
      { id: event1Id, sequence: 0 },
      { id: event2Id, sequence: 0 },
    ]
    return (
      expectSaga(sagas)
        .provide([
          [select(getStartingEvents), []],
          [select(getEndingEvents), endingEvents],
          [
            select(getLockSlots),
            [
              ["2", event1Id],
              ["3", event2Id],
            ],
          ],
          [select(getDoorLocks), ["front_door", "car_port_door"]],
          [call(createMqttClient), mqtt],
        ])
        .dispatch({ type: "SCHEDULE_EVENTS", payload: new Date() })
        // Event 1
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/disable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_front_door_2",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/disable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_car_port_door_2",
            }),
            { qos: 2 },
          ],
        })
        // Event 2
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/disable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_front_door_3",
            }),
            { qos: 2 },
          ],
        })
        .call.like({
          fn: mqtt.publish,
          args: [
            "/homeassistant/guest-pin/disable",
            JSON.stringify({
              entity_id: "input_boolean.enabled_car_port_door_3",
            }),
            { qos: 2 },
          ],
        })
        .run()
    )
  })
})
