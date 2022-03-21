import { merge } from "lodash"
import getMinuteAccurateDate from "../getMinuteAccurateDate"
import { defaultState } from "../reducer"
import {
  getChronologicalEvents,
  getGuestWifiNetwork,
  getStartingEvents,
  getUnassignedChronologicalEvents,
} from "../selectors"

const beforeNow = new Date()
beforeNow.setDate(beforeNow.getDate() - 1)
const now = new Date()
const tomorrow = new Date()
tomorrow.setDate(new Date().getDate() + 1)
const nextWeek = new Date()
nextWeek.setDate(new Date().getDate() + 7)
const nextMonth = new Date()
nextMonth.setDate(new Date().getDate() + 28)
const yesterday = new Date()
yesterday.setDate(new Date().getDate() - 1)

test("getting events with no event data in state", () => {
  const actual = getChronologicalEvents(null)
  expect(actual).toEqual([])
})

test("getting events in chronological order", () => {
  const actual = getChronologicalEvents(
    merge({}, defaultState, {
      events: {
        "1": {
          id: "1",
        },
        "2": {
          id: "2",
        },
      },
      eventOrder: ["2", "1"],
    })
  )
  expect(actual).toEqual([
    {
      id: "2",
    },
    {
      id: "1",
    },
  ])
})

describe("getting unscheduled events", () => {
  test("returns ordered events that have not already been assigned a guest slot", () => {
    const event1 = {
      id: "1",
    }
    const event2 = {
      id: "2",
    }
    const state = merge({}, defaultState, {
      events: {
        [event1.id]: event1,
        [event2.id]: event2,
      },
      eventOrder: [event1.id, event2.id],
      guestSlots: {
        "1": event1.id,
        "2": null,
      },
    })
    const actual = getUnassignedChronologicalEvents(state)
    expect(actual).toEqual([event2])
  })
})

describe("get events to schedule", () => {
  test("returns unscheduled events that start on this minute", () => {
    const event1 = {
      id: "1",
      start: {
        dateTime: now.toISOString(),
      },
    }
    const event2 = {
      id: "2",
      start: {
        date: now.toISOString(),
      },
    }
    const state = merge({}, defaultState, {
      events: {
        [event1.id]: event1,
        [event2.id]: event2,
      },
      eventOrder: [event1.id, event2.id],
      lastScheduledTime: getMinuteAccurateDate(now),
      guestSlots: {
        "1": event1.id,
        "2": null,
      },
    })
    const actual = getStartingEvents(state)
    expect(actual).toEqual([event2])
  })

  test("returns unscheduled events that start before this minute", () => {
    const event1 = {
      id: "1",
      start: {
        dateTime: beforeNow.toISOString(),
      },
    }
    const event2 = {
      id: "2",
      start: {
        date: beforeNow.toISOString(),
      },
    }
    const state = merge({}, defaultState, {
      events: {
        [event1.id]: event1,
        [event2.id]: event2,
      },
      eventOrder: [event1.id, event2.id],
      lastScheduledTime: getMinuteAccurateDate(now),
      guestSlots: {
        "1": event2.id,
        "2": null,
      },
    })
    const actual = getStartingEvents(state)
    expect(actual).toEqual([event1])
  })
})

describe("getting guest network information", () => {
  const actual = getGuestWifiNetwork(
    merge({}, defaultState, {
      guestNetwork: {
        ssid: "test",
        password: "testing",
      },
    })
  )
  expect(actual).toEqual({
    ssid: "test",
    password: "testing",
  })
})
