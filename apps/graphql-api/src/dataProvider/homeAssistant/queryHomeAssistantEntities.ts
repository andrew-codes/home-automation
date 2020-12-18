import { config } from "dotenv"
config()
import createDebugger from "debug"
import DataLoader from "dataloader"
import HomeAssistant from "homeassistant"
import { get } from "lodash/fp"
import { isEmpty, lowerCase } from "lodash"
import { keyBy, trim } from "lodash"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { IProvideData } from "../DataProvider"
import { nameFromId, toCamelCaseProperties } from "./stringManipulations"
import { UnsupportedDomainError } from "../Errors"
import { countApiCall } from "../dataSourceBatchPerformance"
import { cache } from "../../cache"

const debug = createDebugger(
  "@ha/graphql-api/dataProvider/homeAssistant/domain"
)
const { HA_HOST, HA_PORT, HA_TOKEN } = process.env
let ha
const getAll = async (): Promise<object> => {
  ha =
    ha ||
    new HomeAssistant({
      host: HA_HOST,
      port: HA_PORT,
      token: HA_TOKEN,
      ignoreCert: true,
    })
  let haEntities = cache.get("ha-entities") as any[]
  if (!haEntities) {
    haEntities = await ha.states.list()
    cache.set("ha-entities", haEntities, 0)
    countApiCall("home-assistant-api")
  }
  const extractAreaName = /.*(\(.*\)).*/
  let areaName = ""
  const entities = haEntities.map((haEntity) => {
    const area = extractAreaName.exec(haEntity.attributes?.friendly_name)
    let areaId
    if (!!area && area.length > 0) {
      areaName = area[1].replace(/[()]/g, "")
      areaId = `area.${lowerCase(areaName).replace(/ /g, "_")}`
    }
    const outResult = {
      id: haEntity.entity_id,
      state: haEntity.state,
      areaId,
      name:
        trim(haEntity.attributes?.friendly_name).replace(
          `(${areaName}) `,
          ""
        ) || nameFromId(haEntity.entity_id.split(".")[1]),
      domainId: haEntity.entity_id.split(".")[0],
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

const createDataProvider = (): IProvideData => {
  const load = new DataLoader(batchIds)

  const canExecuteQuery = (q) => q.from === "home_assistant_entity"
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
