import { Domain, DomainQuery, DomainResults } from "../Domain"

export interface IProvideData {
  query(
    query: DomainQuery<Domain>
  ): Promise<DomainResults[Domain][] | DomainResults[Domain] | Error>
}

export interface IProvideDomainData<TDomain extends Domain> {
  query(
    query: DomainQuery<TDomain>
  ): Promise<DomainResults[TDomain][] | DomainResults[TDomain] | Error>
  canExecuteQuery(query: DomainQuery<Domain>): boolean
}
