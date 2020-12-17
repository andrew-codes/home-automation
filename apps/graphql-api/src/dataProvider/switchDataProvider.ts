import { Domain, DomainQuery } from "../Domain"
import { IProvideData, IProvideDomainData } from "./DataProvider"
import { UnsupportedDomainError } from "./Errors"

const createDataProvider = (
  providers: IProvideDomainData<Domain>[]
): IProvideData => {
  const query = async <TDomain extends Domain>(q: DomainQuery<Domain>) => {
    const provider = providers.find((p) =>
      p.canExecuteQuery(q)
    ) as IProvideDomainData<TDomain>
    if (!provider) {
      throw new UnsupportedDomainError("No provider for query")
    }
    return provider.query(q as DomainQuery<TDomain>)
  }
  return {
    query,
  }
}

export { createDataProvider }
