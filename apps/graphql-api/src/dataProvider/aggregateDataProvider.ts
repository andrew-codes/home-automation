import { merge } from "lodash"
import { Domain, DomainQuery } from "../Domain"
import { IProvideData, IProvideDomainData } from "./DataProvider"

const createDataProvider = <TDomain extends Domain>(
  providers: IProvideDomainData<TDomain>[]
): IProvideDomainData<TDomain> => {
  const canExecuteQuery = (q) => q.from === "entity_domain"
  const query = async (q: DomainQuery<TDomain>) => {
    if (!canExecuteQuery(q)) {
      throw new Error("Not supported domain for query")
    }
    const allResults = await Promise.all(providers.map((p) => p.query(q)))
    return merge([], ...allResults)
  }
  return { query, canExecuteQuery }
}

export { createDataProvider }
