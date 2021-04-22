import { get } from "lodash/fp"
import { createSelector } from "reselect"

const getUnscheduledEvents = (state) => state.toBeScheduled || []

const getLockEntries = (state) => Object.entries(state.locks)

const getAvailableLocks = createSelector(getLockEntries, (locks) =>
  locks.filter(([key, value]) => !value).map(get(0))
)

export { getAvailableLocks, getLockEntries, getUnscheduledEvents }
