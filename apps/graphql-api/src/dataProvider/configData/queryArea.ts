import createDebugger from "debug"
import { get } from "lodash/fp"
import { isEmpty } from "lodash"
import { DomainArea } from "../../Domain"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { IProvideDomainData } from "../DataProvider"
import DataLoader from "dataloader"
import { ItemNotFoundByIdError, UnsupportedDomainError } from "../Errors"

const debug = createDebugger("@ha/graphql-api/dataProvider/homeAssistant/area")

const getAll = () => {
  return {
    "area.gaming_room": { name: "Gaming Room" },
    "area.andrew_s_office": { name: "Andrew's Office" },
    "area.dorri_s_office": { name: "Dorri's Office" },
    "area.kitchen": { name: "Kitchen" },
    "area.living_room": { name: "Living Room" },
    "area.master_bedroom": { name: "Master Bedroom" },
    "area.master_bathroom": { name: "Master Bathroom" },
    "area.guest_bedroom": { name: "Guest Bedroom" },
    "area.guest_bathroom": { name: "Guest Bathroom" },
  }
}

const filterResults = async (applyFilter) => {
  const data = getAll()
  const results = Object.entries(data).map(([key, value]) => ({
    id: key,
    ...value,
  }))
  return applyFilter(results)
}

const batchIds = async (ids) => {
  const results = getAll()
  return ids.map((id) => {
    const result = results[id]
    if (!result) {
      return new ItemNotFoundByIdError(id)
    }
    return {
      ...result,
      id: id,
    }
  })
}
const load = new DataLoader(batchIds)

const createDataProvider = (): IProvideDomainData<DomainArea> => {
  const canExecuteQuery = (q) => q.from === "area"
  const query = async (q) => {
    if (!canExecuteQuery(q)) {
      throw new UnsupportedDomainError(q)
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
