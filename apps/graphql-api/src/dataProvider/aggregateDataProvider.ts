import { merge } from "lodash"
import { Domain, DomainQuery } from "../Domain"
import { IProvideDomainData } from "./DataProvider"
import { UnsupportedDomainError } from "./Errors"

const createDataProvider = <TDomain extends Domain>(
  providers: IProvideDomainData<TDomain>[]
): IProvideDomainData<TDomain> => {
  const canExecuteQuery = (q) => providers.every((p) => p.canExecuteQuery(q))
  const query = async (q: DomainQuery<TDomain>) => {
    if (!canExecuteQuery(q)) {
      throw new UnsupportedDomainError("Not supported domain for query")
    }
    const allResults = await Promise.all(providers.map((p) => p.query(q)))
    return merge([], ...allResults)
  }
  return { query, canExecuteQuery }
}

export { createDataProvider }
