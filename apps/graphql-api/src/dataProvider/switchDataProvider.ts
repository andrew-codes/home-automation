import { Domain, DomainQuery } from "../Domain"
import { IProvideData, IProvideDomainData } from "./DataProvider"

const createDataProvider = (
  providers: IProvideDomainData<Domain>[]
): IProvideData => {
  const query = async (q: DomainQuery<Domain>) => {
    const provider = providers.find((p) => p.canExecuteQuery(q))
    if (!provider) {
      throw new Error("No provider for query")
    }
    return provider.query(q)
  }
  return {
    query,
  }
}

export { createDataProvider }
