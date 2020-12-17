import { config } from "dotenv"
config()
import createDebugger from "debug"
import DataLoader from "dataloader"
import HomeAssistant from "homeassistant"
import { get } from "lodash/fp"
import { isEmpty } from "lodash"
import { keyBy, trim } from "lodash"
import { DomainHomeAssistantEntity, DomainQuery } from "../../Domain"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { IProvideDomainData } from "../DataProvider"
import { nameFromId, toCamelCaseProperties } from "./stringManipulations"

const debug = createDebugger(
  "@ha/graphql-api/dataProvider/homeAssistant/domain"
)
const { HA_HOST, HA_PORT, HA_TOKEN } = process.env
const ha = new HomeAssistant({
  host: HA_HOST,
  port: HA_PORT,
  token: HA_TOKEN,
  ignoreCert: true,
})

const getAll = async (): Promise<object> => {
  const haEntities = await ha.states.list()
  const entities = haEntities.map((haEntity) => {
    const outResult = {
      id: haEntity.entity_id,
      state: haEntity.state,
      name:
        trim(haEntity.attributes?.friendly_name) ||
        nameFromId(haEntity.entity_id.split(".")[1]),
      domainId: haEntity.entity_id.split(".")[0],
      areaId: "area.gaming_room",
      attributes: toCamelCaseProperties(haEntity.attributes),
    }
    return outResult
  })
  return keyBy(entities, "id")
}

const batchIds = async (ids) => {
  const results = await getAll()
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

const filterResults = async (applyFilter) => {
  const data = await getAll()
  const results = Object.entries(data).map(([key, value]) => ({
    id: key,
    ...value,
  }))
  const output = applyFilter(results)
  if (output.length === 1) {
    return output[0]
  }
  return output
}

const createDataProvider = (): IProvideDomainData<DomainHomeAssistantEntity> => {
  const load = new DataLoader(batchIds)

  const canExecuteQuery = (q) => q.from === "home_assistant_entity"
  const query = async (q: DomainQuery<DomainHomeAssistantEntity>) => {
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
