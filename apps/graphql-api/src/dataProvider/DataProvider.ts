import { Domain, DomainQuery, DomainResults } from "../Domain"

export interface IProvideData {
  query(query: DomainQuery<Domain>): Promise<DomainResults[Domain][]>
}

export interface IProvideDomainData<TDomain extends Domain>
  extends IProvideData {
  query(query: DomainQuery<TDomain>): Promise<Array<DomainResults[TDomain]>>
}
