import { get } from "lodash/fp"
import { isEmpty } from "lodash"
import { createSelector } from "reselect"

const getEventList = (state) =>
  !isEmpty(state.calendarEvents) ? Object.values(state.calendarEvents) : []

const getUnscheduledEvents = createSelector<any, any[], any[]>(
  getEventList,
  (calendarEvents) =>
    calendarEvents.filter((calendarInvite) => !calendarInvite.isScheduled)
)

const getLockSlots = (state) => Object.entries(state.locks)

const getAvailableLockSlots = createSelector(getLockSlots, (locks) =>
  locks.filter(([key, value]) => !value).map(get(0))
)

const getDoorLocks = (state) => state.doorLocks

export {
  getAvailableLockSlots,
  getDoorLocks,
  getLockSlots,
  getUnscheduledEvents,
}
