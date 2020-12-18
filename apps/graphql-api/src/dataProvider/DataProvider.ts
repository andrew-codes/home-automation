import { Domain, DomainQuery, DomainResults } from "../Domain"

export interface IProvideData {
  query<TDomain extends Domain>(
    query: DomainQuery<TDomain>
  ): Promise<DomainResults[TDomain][] | DomainResults[TDomain]>
  canExecuteQuery(query: DomainQuery<Domain>): boolean
}

export interface IProvideDomainData<TDomain extends Domain> {
  query(
    query: DomainQuery<TDomain>
  ): Promise<DomainResults[TDomain][] | DomainResults[TDomain]>
  canExecuteQuery(query: DomainQuery<Domain>): boolean
}
