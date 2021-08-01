import { calendar_v3 } from "googleapis"
import { defaultTo } from "lodash"
import { get } from "lodash/fp"
import { createSelector, Selector } from "reselect"
import getMinuteAccurateDate from "./getMinuteAccurateDate"
import { State } from "./reducer"

type Entry<X extends string, Y> = [X, Y]

const getEvents: Selector<State, Record<string, calendar_v3.Schema$Event>> = (
  state
) => state?.events ?? {}
const getDeletedEventDictionary: Selector<
  State,
  Record<string, calendar_v3.Schema$Event>
> = (state) => state.deletedEvents ?? {}
const getEventOrder: Selector<State, string[]> = (state) =>
  state?.eventOrder ?? []
const getLastScheduleTime: Selector<State, Date | null> = (state) =>
  state?.lastScheduledTime
const getCodes: Selector<State, string[]> = (state) => state.codes
const getCurrentCodeIndex: Selector<State, number> = (state) => state.codeIndex
const getDoorLocks: Selector<State, string[]> = (state) => state.doorLocks

const getLockSlots: Selector<State, Entry<string, string>[]> = (state) =>
  Object.entries(state?.guestSlots ?? {})

const getDeletedEvents = createSelector<
  State,
  Record<string, calendar_v3.Schema$Event>,
  calendar_v3.Schema$Event[]
>(getDeletedEventDictionary, (events) => Object.values(events))

const getAvailableLockSlots = createSelector<
  State,
  Entry<string, string>[],
  string[]
>(getLockSlots, (slots) => slots.filter(([key, value]) => !value).map(get(0)))

const getChronologicalEvents = createSelector<
  State,
  Record<string, calendar_v3.Schema$Event>,
  string[],
  calendar_v3.Schema$Event[]
>([getEvents, getEventOrder], (events, eventOrder) =>
  eventOrder.map((id) => events[id])
)
const getUnassignedChronologicalEvents = createSelector<
  State,
  calendar_v3.Schema$Event[],
  Entry<string, string>[],
  calendar_v3.Schema$Event[]
>([getChronologicalEvents, getLockSlots], (events, slots) =>
  events.filter((id) => !slots.map(get(1)).includes(id))
)

const getEndingEvents = createSelector<
  State,
  calendar_v3.Schema$Event[],
  calendar_v3.Schema$Event[],
  Date | null,
  calendar_v3.Schema$Event[]
>(
  [getChronologicalEvents, getDeletedEvents, getLastScheduleTime],
  (events, deletedEvents, scheduleTime) =>
    events
      .filter((event) => {
        const end = getMinuteAccurateDate(
          new Date(defaultTo(event?.end?.dateTime, event?.end?.date))
        )
        return end.toLocaleString() === scheduleTime?.toLocaleString()
      })
      .concat(deletedEvents)
)

const getStartingEvents = createSelector<
  State,
  calendar_v3.Schema$Event[],
  Date | null,
  calendar_v3.Schema$Event[]
>(
  [getUnassignedChronologicalEvents, getLastScheduleTime],
  (events, scheduleTime) =>
    events.filter((event) => {
      const start = getMinuteAccurateDate(
        new Date(defaultTo(event?.start?.dateTime, event?.start?.date))
      )
      return start.toLocaleString() === scheduleTime?.toLocaleString()
    })
)

export {
  getUnassignedChronologicalEvents,
  getAvailableLockSlots,
  getCodes,
  getChronologicalEvents,
  getCurrentCodeIndex,
  getDoorLocks,
  getEndingEvents,
  getLockSlots,
  getStartingEvents,
}
