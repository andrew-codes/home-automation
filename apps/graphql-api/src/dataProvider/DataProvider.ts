import { Domain, DomainQuery, DomainResults } from "../Domain"
import { Filter } from "../filter/filter"

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

export interface IExecuteDataQuery<TQueryType> {
  executeQuery(TQueryType): Promise<any>
}

export interface IConvertToDataQuery<TDomain extends Domain, TQueryType> {
  toDataQuery(query: DomainQuery<TDomain>): TQueryType
}

export interface IApplyFilterToQuery<TIntermediateQuery> {
  applyFilter(query: TIntermediateQuery): TIntermediateQuery
}
