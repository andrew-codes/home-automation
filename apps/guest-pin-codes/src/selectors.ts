import { get } from "lodash/fp"
import { isEmpty } from "lodash"
import { createSelector } from "reselect"

const getEvents = (state) => state.events || {}
const getEventOrder = (state) => state.eventOrder || []

const getCodes = (state) => state.codes
const getCurrentCodeIndex = (state) => state.codeIndex

const getEventList = (state) =>
  !isEmpty(state.events) ? Object.values(state.events) : []

const getUnscheduledEvents = createSelector<any, any[], any[]>(
  getEventList,
  (calendarEvents) =>
    calendarEvents.filter((calendarInvite) => !calendarInvite.isScheduled)
)

const getLockSlots = (state) => Object.entries(state.guestSlots)

const getAvailableLockSlots = createSelector(getLockSlots, (slots) =>
  slots.filter(([key, value]) => !value).map(get(0))
)
const getChronologicalEvents = createSelector(
  [getEvents, getEventOrder, getLockSlots],
  (events, eventOrder) => eventOrder.map((id) => events[id])
)
const getUnassignedChronologicalEvents = createSelector(
  [getChronologicalEvents, getLockSlots],
  (events, slots) => events.filter((id) => !Object.values(slots).includes(id))
)

const getDoorLocks = (state) => state.doorLocks

export {
  getUnassignedChronologicalEvents,
  getAvailableLockSlots,
  getCodes,
  getChronologicalEvents,
  getCurrentCodeIndex,
  getDoorLocks,
  getEventList,
  getLockSlots,
  getUnscheduledEvents,
}
