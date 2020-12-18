import { Domain, DomainQuery } from "../Domain"
import { IProvideData } from "./DataProvider"
import { UnsupportedDomainError } from "./Errors"

const createDataProvider = (providers: IProvideData[]): IProvideData => {
  const canExecuteQuery = (q) => !!providers.find((p) => p.canExecuteQuery(q))
  const query = async <TDomain extends Domain>(q: DomainQuery<TDomain>) => {
    const provider = providers.find((p) =>
      p.canExecuteQuery((q as unknown) as DomainQuery<Domain>)
    )
    if (!provider) {
      throw new UnsupportedDomainError(q)
    }
    return provider.query<TDomain>(q)
  }
  return {
    canExecuteQuery,
    query,
  }
}

export { createDataProvider }
