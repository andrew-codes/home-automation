import createDebugger from "debug"
import DataLoader from "dataloader"
import { get } from "lodash/fp"
import { isEmpty } from "lodash"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { IProvideData } from "../DataProvider"

const debug = createDebugger(
  "@ha/graphql-api/dataProvider/homeAssistant/domain"
)

const getAll = () => {
  return {
    device_tracker: { name: "Device Tracker" },
    group: { name: "Group" },
    light: { name: "Light" },
    media_player: { name: "Media Player" },
    sensor: { name: "Sensor" },
  }
}

const batchIds = async (ids) => {
  const results = getAll()
  return ids.map((id) => {
    const result = results[id]
    if (!result) {
      return new Error(`Not Found, ${id}`)
    }
    return {
      ...result,
      id: id,
    }
  })
}
const load = new DataLoader(batchIds)

const filterResults = async (applyFilter) => {
  const data = getAll()
  const results = Object.entries(data).map(([key, value]) => ({
    id: key,
    ...value,
  }))
  return applyFilter(results)
}

const createDataProvider = (): IProvideData => {
  const canExecuteQuery = (q) => q.from === "entity_domain"
  const query = async (q) => {
    if (!canExecuteQuery(q)) {
      throw new Error("Unsupported domain for provider")
    }
    if (
      !isEmpty(q.filters) &&
      q.filters?.reduce((acc, filter) => acc && filter.attribute === "id", true)
    ) {
      if (q.filters.reduce((acc, f) => acc && !!f.value, true)) {
        if (q.filters.length > 1) {
          return load.loadMany(q.filters.map(get("value")))
        }
        return load.load(q.filters[0].value)
      }
    }
    const applyFilters = createFilterApplicator(q.filters)
    return filterResults(applyFilters)
  }

  return {
    query,
    canExecuteQuery,
  }
}

export { createDataProvider }
