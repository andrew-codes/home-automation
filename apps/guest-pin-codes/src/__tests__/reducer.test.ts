import { merge } from "lodash"
import {
  addCodesToPool,
  addDoorLocks,
  setGuestSlots,
  setEvents,
  scheduleEvents,
  setGuestWifiNetworkInformation,
} from "../actionCreators"
import getMinuteAccurateDate from "../getMinuteAccurateDate"
import reducer, { defaultState, State } from "../reducer"

const tomorrow = new Date()
tomorrow.setDate(new Date().getDate() + 1)
const nextWeek = new Date()
nextWeek.setDate(new Date().getDate() + 7)
const nextMonth = new Date()
nextMonth.setDate(new Date().getDate() + 28)
const yesterday = new Date()
yesterday.setDate(new Date().getDate() - 1)

describe("set events", () => {
  test("set events with no events", () => {
    const actual = reducer(undefined, setEvents([]))
    expect(actual.events).toEqual({})
  })

  test("setting events with a deleted event (present in state, but not in fetched events), will mark event as deleted", () => {
    const deletedEvent = createEvent({
      summary: "my other event",
      end: {
        date: tomorrow.toDateString(),
      },
    })
    const state = createState({
      eventOrder: [deletedEvent.id],
      events: {
        [deletedEvent.id]: deletedEvent,
      },
    })

    const actual = reducer(state, setEvents([]))
    expect(actual.events).toEqual({})
    expect(actual.deletedEvents).toEqual({
      [deletedEvent.id]: deletedEvent,
    })
  })

  test("set events overwrites existing events with new events", () => {
    const event = createEvent({
      summary: "my other event",
      end: {
        date: tomorrow.toDateString(),
      },
    })
    const state = createState({
      events: {
        [event.id]: event,
      },
    })
    const newEvent = merge({}, event, {
      end: { date: nextWeek.toDateString() },
    })
    const actual = reducer(state, setEvents([newEvent]))

    expect(actual.events).toEqual({
      [event.id]: expect.objectContaining(newEvent),
    })
  })

  test("set events ignores duplicate events by taking the last event with the same ID", () => {
    const state = createState()
    const event1 = createEvent({
      summary: "my other event",
      end: {
        date: tomorrow.toDateString(),
      },
    })
    const event2 = merge({}, event1, {
      summary: "a new summary",
    })
    const actual = reducer(state, setEvents([event1, event2]))

    expect(actual.events).toEqual({
      [event2.id]: event2,
    })
  })

  test("set events with an end date before now are not set", () => {
    const state = createState()
    const event1 = createEvent({
      start: {
        dateTime: nextWeek.toDateString(),
      },
      end: {
        dateTime: nextWeek.toDateString(),
      },
    })
    const actualWithEndDate = reducer(
      state,
      setEvents([
        event1,
        createEvent({
          end: {
            date: yesterday.toDateString(),
          },
        }),
      ]),
    )
    expect(actualWithEndDate.events).toEqual({
      [event1.id]: event1,
    })

    const actualWithEndDateTime = reducer(
      state,
      setEvents([
        createEvent({
          end: {
            dateTime: yesterday.toDateString(),
          },
        }),
      ]),
    )

    expect(actualWithEndDateTime.events).toEqual({})
  })

  test("setting events stores the events in chronologoical order based on start date", () => {
    const state = createState()
    const event1 = createEvent({
      start: {
        dateTime: tomorrow.toDateString(),
      },
      end: {
        dateTime: tomorrow.toDateString(),
      },
    })
    const event2 = createEvent({
      start: {
        dateTime: nextWeek.toDateString(),
      },
      end: {
        dateTime: nextWeek.toDateString(),
      },
    })
    const event3 = createEvent({
      start: {
        dateTime: nextMonth.toDateString(),
      },
      end: {
        dateTime: nextMonth.toDateString(),
      },
    })
    const event4 = createEvent({
      start: {
        dateTime: nextMonth.toDateString(),
      },
      end: {
        dateTime: nextMonth.toDateString(),
      },
    })
    const actual = reducer(state, setEvents([event2, event3, event4, event1]))

    expect(actual.eventOrder).toEqual([
      event1.id,
      event2.id,
      event3.id,
      event4.id,
    ])
  })
})

describe("scheudule events", () => {
  test("scheduling events records the time stamp", () => {
    const state = createState()
    const actual = reducer(undefined, scheduleEvents(tomorrow))
    const tomorrowMinutePrecision = getMinuteAccurateDate(tomorrow)
    expect(actual.lastScheduledTime).toEqual(tomorrowMinutePrecision)
  })
})

test("scheduled ending events are deleted from deleted events and events", () => {
  const deletedEvent = createEvent({
    summary: "my other event",
    end: {
      date: tomorrow.toDateString(),
    },
  })
  const futureEvent = createEvent({
    summary: "future event",
    end: {
      date: tomorrow.toDateString(),
    },
  })
  const scheduledEndingEvent = createEvent({
    summary: "ended event",
    end: {
      date: tomorrow.toDateString(),
    },
  })
  const state = createState({
    eventOrder: [scheduledEndingEvent.id, futureEvent.id],
    events: {
      [futureEvent.id]: futureEvent,
      [scheduledEndingEvent.id]: scheduledEndingEvent,
    },
    deletedEvents: {
      [deletedEvent.id]: deletedEvent,
    },
  })
  const actual = reducer(state, {
    type: "REMOVE_EVENTS",
    payload: [scheduledEndingEvent, deletedEvent],
  })
  expect(actual.eventOrder).toEqual([futureEvent.id])
  expect(actual.events).toEqual({
    [futureEvent.id]: futureEvent,
  })
  expect(actual.deletedEvents).toEqual({})
})

test("set the guest slots by a continguous block starting at an offset index", () => {
  const state = createState()
  const actual = reducer(state, setGuestSlots(5, 2))
  expect(actual.guestSlots).toEqual({
    "2": null,
    "3": null,
    "4": null,
    "5": null,
    "6": null,
  })
})

test("adding PIN codes to pool and maintains their order", () => {
  const state = createState({
    codes: ["1"],
  })
  const actual = reducer(state, addCodesToPool(["2", "3"]))
  expect(actual.codes).toEqual(["1", "2", "3"])
})

test("adding additional door locks to track only tracks unique values", () => {
  const state = createState({ doorLocks: ["front_door", "car_port_door"] })
  const actual = reducer(state, addDoorLocks(["car_port_door", "back_door"]))
  expect(actual.doorLocks).toEqual(["front_door", "car_port_door", "back_door"])
})

test("setting guest wifi network information", () => {
  const state = createState()
  const actual = reducer(
    state,
    setGuestWifiNetworkInformation("test", "testing"),
  )
  expect(actual.guestNetwork).toEqual({
    ssid: "test",
    password: "testing",
  })
})

function createState(state = {}): State {
  return merge({}, defaultState, state)
}

let id = 0
function createEvent(event = {}) {
  return merge({ summary: "a summary", end: {}, start: {} }, event, {
    id: (id++).toString(),
  })
}
