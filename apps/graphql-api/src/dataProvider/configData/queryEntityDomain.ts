import createDebugger from "debug"
import { Base } from "../../Domain"
import { createFilterApplicator } from "../filterApplicators/valueFilterApplicators"
import { nameFromId } from "../homeAssistant/stringManipulations"
import { IProvideData } from "../DataProvider"

const debug = createDebugger(
  "@ha/graphql-api/dataProvider/homeAssistant/domain"
)

type DomainData = {
  id: string
  name?: string
}
const fetchAllDomains = async (): Promise<Array<Base>> => {
  const domains: Array<DomainData> = [
    { id: "light" },
    { id: "media_player" },
    { id: "device_tracker" },
    { id: "sensor" },
  ]
  return domains.map((domain: DomainData) => ({
    ...domain,
    name: domain.name || nameFromId(domain.id),
  }))
}

const createDataProvider = (): IProvideData => {
  const query = async (q) => {
    try {
      if (q.from !== "entity_domain") {
        return []
      }
      const applyFilters = createFilterApplicator(q.filters)
      const domains = await fetchAllDomains()
      return applyFilters(domains)
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
