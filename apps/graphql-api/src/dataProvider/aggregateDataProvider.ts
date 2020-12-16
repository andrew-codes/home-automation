import { merge } from "lodash"
import { Domain, DomainQuery } from "../Domain"
import { IProvideData, IProvideDomainData } from "./DataProvider"
const createDataProvider = (
  providers: IProvideDomainData<Domain>[]
): IProvideData => {
  const query = async (q: DomainQuery<Domain>) => {
    const queryResults = await Promise.all(
      providers.map(async (p) => await p.query(q))
    )
    return merge([], ...queryResults)
  }
  return { query }
}

export { createDataProvider }
