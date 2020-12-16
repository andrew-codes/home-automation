import createDebugger from "debug"
import { Base } from "../../Domain"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { IProvideData } from "../DataProvider"

const debug = createDebugger("@ha/graphql-api/dataProvider/homeAssistant/area")

const fetchAllAreas = async (): Promise<Array<Base>> => {
  return [
    { id: "area.gaming_room", name: "Gaming Room" },
    { id: "area.andrew_s_office", name: "Andrew's Office" },
    { id: "area.dorri_s_office", name: "Dorri's Office" },
    { id: "area.kitchen", name: "Kitchen" },
    { id: "area.living_room", name: "Living Room" },
    { id: "area.master_bedroom", name: "Master Bedroom" },
    { id: "area.master_bathroom", name: "Master Bathroom" },
    { id: "area.guest_bedroom", name: "Guest Bedroom" },
    { id: "area.guest_bathroom", name: "Guest Bathroom" },
  ]
}
const createDataProvider = (): IProvideData => {
  const query = async (q) => {
    try {
      if (q.from !== "area") {
        return []
      }
      const applyFilters = createFilterApplicator(q.filters)
      const allResults = await fetchAllAreas()
      return applyFilters(allResults)
    } catch (error) {
      debug(error)
      return []
    }
  }

  return {
    query,
  }
}

export { createDataProvider }
