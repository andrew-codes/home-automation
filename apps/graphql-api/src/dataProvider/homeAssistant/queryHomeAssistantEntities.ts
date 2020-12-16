import createDebugger from "debug"
import { trim } from "lodash"
import {
  Domain,
  DomainArea,
  DomainQuery,
  HomeAssistantEntity,
} from "../../Domain"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { IProvideData, IProvideDomainData } from "../DataProvider"
import { nameFromId, toCamelCaseProperties } from "./stringManipulations"

const debug = createDebugger(
  "@ha/graphql-api/dataProvider/homeAssistant/domain"
)

const fetchEntities = async (
  ha,
  areaDataProvider: IProvideDomainData<DomainArea>
): Promise<HomeAssistantEntity[]> => {
  const areas = await areaDataProvider.query({ from: "area" })
  const haEntities = await ha.states.list()
  return haEntities.map((haEntity) => {
    const area = areas.find((a) => {
      return haEntity.attributes?.friendly_name?.includes(`(${a.name})`)
    })
    const outResult = {
      id: haEntity.entity_id,
      state: haEntity.state,
      name:
        trim(
          haEntity.attributes?.friendly_name?.replace(`(${area?.name})`, "")
        ) || nameFromId(haEntity.entity_id.split(".")[1]),
      domainId: haEntity.entity_id.split(".")[0],
      areaId: area?.id,
      attributes: toCamelCaseProperties(haEntity.attributes),
    }
    return outResult
  })
}

const createDataProvider = (
  ha,
  areaDataProvider: IProvideDomainData<DomainArea>
): IProvideData => {
  const query = async (q: DomainQuery<Domain>) => {
    try {
      if (q.from !== "home_assistant_entity") {
        return []
      }
      const applyFilters = createFilterApplicator(q.filters)
      const allResults = await fetchEntities(ha, areaDataProvider)
      // console.log(q.filters)
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
