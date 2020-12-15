import createDebugger from "debug"
import _ from "lodash"
import _fp from "lodash/fp.js"
import { equality } from "../filter/index.js"

const debug = createDebugger("@ha/graphql-api/dataProvider/homeAssistant")
const { isEmpty } = _
const { filter } = _fp

const filterHandlers = {
  [equality.type]: (f, value) => {
    const assetValue = value[f.attribute]
    if (f.negation) {
      if (Array.isArray(f.value)) {
        return !f.value.includes(assetValue)
      }
      return assetValue !== f.value
    }
    if (Array.isArray(f.value)) {
      return f.value.includes(assetValue)
    }
    return assetValue === f.value
  },
}

const filterResults = (filters) =>
  filter((item) => {
    if (isEmpty(filters)) {
      return true
    }
    const areAnyFiltersSupported = filters.find((f) => filterHandlers[f.type])
    if (!areAnyFiltersSupported) {
      return true
    }
    const matchingFilter = filters.find((f) => {
      const handleFilter = filterHandlers[f.type]
      if (!handleFilter) {
        return false
      }
      return handleFilter(f, item)
    })
    return Boolean(matchingFilter)
  })

const fetchAllDomains = (ha) => {
  return [
    { id: "light" },
    { id: "media_player" },
    { id: "device_tracker" },
    { id: "sensor" },
  ]
}

const fetchAllAreas = async (ha) => {
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

const fetchDomains = async (ha, filters) => {
  const domains = await fetchAllDomains()
  return filterResults(filters)(domains)
}

const fetchEntities = async (ha, filters) => {
  const haEntities = await ha.states.list()
  // debug("ha states", haEntities)
  const areas = await fetchAllAreas()
  const entities = haEntities.map((result) => {
    const area = areas.find((a) => {
      return result.attributes.friendly_name?.includes(a.name)
    })
    const outResult = {
      ...result.attributes,
      state: result.state,
      name: result.attributes.friendly_name,
      id: result.entity_id,
      domain_id: result.entity_id.split(".")[0],
      area_id: area?.id,
    }
    delete outResult.entity_id
    return outResult
  })
  return filterResults(filters)(entities)
}

const blockedDomains = ["home_assistant_entity_states"]
const createDataProvider = (ha) => {
  const query = async ({ from, filters }) => {
    if (blockedDomains.includes(from)) {
      return []
    }

    try {
      if (from === "home_assistant_domain") {
        return await fetchDomains(ha, filters)
      }

      if (from === "home_assistant_entity") {
        return await fetchEntities(ha, filters)
      }

      if (from === "home_assistant_area") {
        const areas = await fetchAllAreas(ha)
        const output = filterResults(filters)(areas)
        return output
      }
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
