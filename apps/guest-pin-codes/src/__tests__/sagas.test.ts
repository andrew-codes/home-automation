jest.mock("../googleClient")
jest.mock("../mqtt")
import SagaTester from "redux-saga-tester"
import { fetchEvents, scheduleEvents } from "../actionCreators"
import sagas from "../sagas"
import reducer from "../reducer"
import { DISABLED_EVENTS, LAST_USED_CODE, UPDATE_EVENTS } from "../actions"
import { createCalendarClient } from "../googleClient"
import codes from "../candidateCodes"
import createMqttClient from "../mqtt"

let store
let calendarClient = {
  events: {
    list: jest.fn(),
    update: jest.fn(),
  },
}
const mqtt = {
  publish: jest.fn(),
}
beforeEach(() => {
  jest.resetAllMocks()
  ;(createCalendarClient as jest.Mock).mockReturnValue(calendarClient)
  store = new SagaTester({
    initialState: null,
    reducers: reducer,
  })
  ;(createMqttClient as jest.Mock).mockResolvedValue(mqtt)
  store.start(sagas)
})

describe("fetching events saga", () => {
  test("errors in fetching do not crash the saga", () => {
    const now = new Date(2021, 0, 1, 12, 0, 0, 0)
    calendarClient.events.list.mockRejectedValue({})
    store.dispatch(fetchEvents(now))
    store.dispatch(fetchEvents(now))
    store.dispatch(fetchEvents(now))
  })

  test("fetching no events", async () => {
    const now = new Date(2021, 0, 1, 12, 0, 0, 0)
    calendarClient.events.list.mockResolvedValue({
      data: { items: [] },
    })
    store.dispatch(fetchEvents(now))

    await store.waitFor(UPDATE_EVENTS)
    expect(store.getState().events).toEqual({})
  })

  test("fetching events excludes events ending before the specified time", async () => {
    const now = new Date(2021, 0, 1, 12, 0, 0, 0)
    calendarClient.events.list.mockResolvedValue({
      data: {
        items: [
          {
            id: "1",
            end: {
              dateTime: "2020-01-01",
            },
          },
        ],
      },
    })
    store.dispatch(fetchEvents(now))

    await store.waitFor(UPDATE_EVENTS)
    expect(store.getState().events).toEqual({})
  })

  test("fetching events includes events ending after the specified time", async () => {
    const now = new Date(2021, 0, 1, 12, 0, 0, 0)
    const nowPlusAMinute = new Date(2021, 0, 1, 12, 1)
    const inProgressEvent = {
      id: "1",
      end: {
        dateTime: nowPlusAMinute.toLocaleString(),
      },
    }
    calendarClient.events.list.mockResolvedValue({
      data: {
        items: [inProgressEvent],
      },
    })
    store.dispatch(fetchEvents(now))

    await store.waitFor(UPDATE_EVENTS)
    expect(store.getState().events).toEqual({
      "1": inProgressEvent,
    })
  })

  test("fetching events sorts them chronologically", async () => {
    const now = new Date(2021, 0, 1, 12, 0, 0, 0)
    const nowPlusAMinute = new Date(2021, 0, 1, 12, 1)
    const nowPlusTwoMinutes = new Date(2021, 0, 1, 12, 2)
    const nowPlusAnHour = new Date(2021, 0, 1, 13, 0)
    const nowPlusAnHourAndAMinute = new Date(2021, 0, 1, 13, 1)
    const laterEvent = {
      id: "1",
      start: {
        dateTime: nowPlusTwoMinutes.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
    }
    const earlierEvent = {
      id: "2",
      start: {
        dateTime: nowPlusAMinute.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
    }
    const lastEvent = {
      id: "3",
      start: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHourAndAMinute.toLocaleString(),
      },
    }
    const laterEvent2 = {
      id: "4",
      start: {
        dateTime: nowPlusTwoMinutes.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
    }
    calendarClient.events.list.mockResolvedValue({
      data: {
        items: [laterEvent, laterEvent2, lastEvent, earlierEvent],
      },
    })
    store.dispatch(fetchEvents(now))

    await store.waitFor(UPDATE_EVENTS)
    expect(store.getState().eventOrder).toEqual(["2", "1", "4", "3"])
  })
})

describe("start event saga", () => {
  let laterEvent
  let laterEvent2
  let lastEvent
  let earlierEvent

  beforeEach(() => {
    const nowPlusAMinute = new Date(2021, 0, 1, 12, 1)
    const nowPlusTwoMinutes = new Date(2021, 0, 1, 12, 2)
    const nowPlusAnHour = new Date(2021, 0, 1, 13, 0)
    const nowPlusAnHourAndAMinute = new Date(2021, 0, 1, 13, 1)
    laterEvent = {
      id: "1",
      start: {
        dateTime: nowPlusTwoMinutes.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
    }
    earlierEvent = {
      id: "2",
      start: {
        dateTime: nowPlusAMinute.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
    }
    lastEvent = {
      id: "3",
      start: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHourAndAMinute.toLocaleString(),
      },
    }
    laterEvent2 = {
      id: "4",
      start: {
        dateTime: nowPlusTwoMinutes.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
    }
    store = new SagaTester({
      initialState: {
        events: {
          "1": laterEvent,
          "2": earlierEvent,
          "3": lastEvent,
          "4": laterEvent2,
        },
        eventOrder: ["2", "1", "4", "3"],
        codes,
        codeIndex: 0,
        doorLocks: ["front_door", "car_port_door"],
        guestSlots: { "1": null, "2": null },
      },
      reducers: reducer,
    })
    store.start(sagas)
  })

  test("no events are starting at specified time", async () => {
    const now = new Date(2021, 0, 1, 12, 0, 0, 0)
    store.dispatch(scheduleEvents(now))
    expect(store.getState().codeIndex).toEqual(0)
  })

  test("events starting are assigned a the next code and the calendar event is updated with this code", async () => {
    const now = new Date(2021, 0, 1, 12, 2)
    store.dispatch(scheduleEvents(now))
    await store.waitFor(LAST_USED_CODE)

    expect(calendarClient.events.update.mock.calls[0][0]).toMatchObject({
      eventId: "1",
      requestBody: {
        ...laterEvent,
        description: `ACCESS CODE: ${codes[0]}
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew or Dorri

Thank you!`,
      },
    })
    expect(calendarClient.events.update.mock.calls[1][0]).toMatchObject({
      eventId: "4",
      requestBody: {
        ...laterEvent2,
        description: `ACCESS CODE: ${codes[1]}
=================

This code will work on all doors for the duration of this calendar invite. If for any reason the lock does not respond to the code, please do one of the following:

- email Andrew or Dorri

Thank you!`,
      },
    })
    expect(store.getState().codeIndex).toEqual(1)
  })

  test("starting multiple concurrent events enable the assigned code via publising a MQTT message for the number of concurrent guest slots available", async () => {
    const nowPlusTwoMinutes = new Date(2021, 0, 1, 12, 2)
    store.start(sagas)
    store.dispatch(scheduleEvents(nowPlusTwoMinutes))
    await store.waitFor(LAST_USED_CODE)

    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/set",
      JSON.stringify({
        entity_id: `input_text.front_door_pin_1`,
        pin: codes[0],
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/set",
      JSON.stringify({
        entity_id: `input_text.car_port_door_pin_1`,
        pin: codes[0],
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/enable",
      JSON.stringify({
        entity_id: `input_boolean.enabled_front_door_1`,
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/enable",
      JSON.stringify({
        entity_id: `input_boolean.enabled_car_port_door_1`,
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/set",
      JSON.stringify({
        entity_id: `input_text.front_door_pin_2`,
        pin: codes[1],
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/set",
      JSON.stringify({
        entity_id: `input_text.car_port_door_pin_2`,
        pin: codes[1],
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/enable",
      JSON.stringify({
        entity_id: `input_boolean.enabled_front_door_2`,
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/enable",
      JSON.stringify({
        entity_id: `input_boolean.enabled_car_port_door_2`,
      }),
      { qos: 2 }
    )

    expect(store.getState().guestSlots).toEqual({ "1": "1", "2": "4" })
  })

  test("recycles through PIN codes", async () => {
    store = new SagaTester({
      initialState: {
        events: {
          "1": laterEvent,
          "2": earlierEvent,
          "3": lastEvent,
          "4": laterEvent2,
        },
        eventOrder: ["2", "1", "4", "3"],
        codes,
        codeIndex: codes.length,
        doorLocks: ["front_door", "car_port_door"],
        guestSlots: { "1": null },
      },
      reducers: reducer,
    })
    store.start(sagas)
    const now = new Date(2021, 0, 1, 12, 2)
    store.dispatch(scheduleEvents(now))
    await store.waitFor(LAST_USED_CODE)

    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/set",
      JSON.stringify({
        entity_id: `input_text.front_door_pin_1`,
        pin: codes[0],
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/set",
      JSON.stringify({
        entity_id: `input_text.car_port_door_pin_1`,
        pin: codes[0],
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/enable",
      JSON.stringify({
        entity_id: `input_boolean.enabled_front_door_1`,
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/enable",
      JSON.stringify({
        entity_id: `input_boolean.enabled_car_port_door_1`,
      }),
      { qos: 2 }
    )
  })

  test("errors will not crash the saga", async () => {
    const now = new Date(2021, 0, 1, 12, 2)
    calendarClient.events.update.mockRejectedValue({})
    store.dispatch(scheduleEvents(now))
    store.dispatch(scheduleEvents(now))
  })
})

describe("ending event saga", () => {
  let laterEvent2
  let lastEvent

  beforeEach(() => {
    const nowPlusTwoMinutes = new Date(2021, 0, 1, 12, 2)
    const nowPlusAnHour = new Date(2021, 0, 1, 13, 0)
    const nowPlusAnHourAndAMinute = new Date(2021, 0, 1, 13, 1)
    lastEvent = {
      id: "3",
      start: {
        dateTime: nowPlusAnHour.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHourAndAMinute.toLocaleString(),
      },
    }
    laterEvent2 = {
      id: "4",
      start: {
        dateTime: nowPlusTwoMinutes.toLocaleString(),
      },
      end: {
        dateTime: nowPlusAnHourAndAMinute.toLocaleString(),
      },
    }
    store = new SagaTester({
      initialState: {
        events: {
          "4": laterEvent2,
          "3": lastEvent,
        },
        eventOrder: ["4", "3"],
        codes,
        codeIndex: 0,
        doorLocks: ["front_door", "car_port_door"],
        guestSlots: { "1": "4", "2": "3" },
      },
      reducers: reducer,
    })
    store.start(sagas)
  })

  test("no events to stop", async () => {
    const now = new Date(2021, 0, 1, 0, 0)
    store.dispatch(scheduleEvents(now))
    await store.waitFor(DISABLED_EVENTS)
    expect(mqtt.publish).not.toHaveBeenCalled()
  })

  test("ended events disable their PIN codes via publishing MQTT messages", async () => {
    const now = new Date(2021, 0, 1, 13, 1)
    store.dispatch(scheduleEvents(now))
    await store.waitFor(DISABLED_EVENTS)
    expect(store.getState().guestSlots).toEqual({ "1": null, "2": null })
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/disable",
      JSON.stringify({
        entity_id: "input_boolean.enabled_front_door_1",
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/disable",
      JSON.stringify({
        entity_id: "input_boolean.enabled_car_port_door_1",
      }),
      { qos: 2 }
    )

    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/disable",
      JSON.stringify({
        entity_id: "input_boolean.enabled_front_door_2",
      }),
      { qos: 2 }
    )
    expect(mqtt.publish).toHaveBeenCalledWith(
      "/homeassistant/guest-pin/disable",
      JSON.stringify({
        entity_id: "input_boolean.enabled_car_port_door_2",
      }),
      { qos: 2 }
    )
  })
})
