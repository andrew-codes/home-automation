import { get } from "lodash/fp"
import { isEmpty } from "lodash"
import { createSelector } from "reselect"

const getEventList = (state) =>
  !isEmpty(state.calendarEvents)
    ? Object.values(state.calendarEvents).filter((value) => !!value)
    : []

const getUnscheduledEvents = createSelector<any, any[], any[]>(
  getEventList,
  (calendarEvents) =>
    calendarEvents.filter((calendarInvite) => !calendarInvite.isScheduled)
)

const getLockSlots = (state) => Object.entries(state.guestSlots)

const getAvailableLockSlots = createSelector(getLockSlots, (slots) =>
  slots.filter(([key, value]) => !value).map(get(0))
)

const getDoorLocks = (state) => state.doorLocks

export {
  getAvailableLockSlots,
  getDoorLocks,
  getEventList,
  getLockSlots,
  getUnscheduledEvents,
}
