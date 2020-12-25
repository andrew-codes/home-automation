import { MongoClient } from "mongodb"
import { Domain, DomainQuery } from "../../Domain"
import { Filter, SupportedFilters } from "../../filter/filter"
import {
  IExecuteDataQuery,
  IConvertToDataQuery,
  IApplyFilterToQuery,
} from "../DataProvider"

export type MongoOperator = "$in" | "$or"

export type MongoFilter<TDomain extends Domain> =
  | {}
  | {
      [P in keyof TDomain]:
        | TDomain[P]
        | {
            [key in MongoOperator]: TDomain[P]
          }
    }

export type MongoQuery = (db) => any[]

export const equalityFilterApplicator = <TDomain extends Domain>(
  filter: Filter<TDomain>
): IApplyFilterToQuery<MongoFilter<TDomain>> => ({
  applyFilter(intermediateQuery) {
    let attribute = filter.attribute as string
    if (Array.isArray(attribute)) {
      attribute = attribute.join(".")
    }
    if (Array.isArray(filter.value)) {
      return {
        ...intermediateQuery,
        [attribute]: {
          $in: filter.value,
        },
      }
    }
    return {
      ...intermediateQuery,
      [attribute]: filter.value,
    }
  },
})

export class MongoFilterApplicator<TDomain extends Domain>
  implements IApplyFilterToQuery<MongoFilter<TDomain>> {
  private domainQuery: DomainQuery<TDomain>
  private filterApplicatorMap: {
    [T in SupportedFilters]: (
      filter: Filter<TDomain>
    ) => IApplyFilterToQuery<MongoFilter<TDomain>>
  }
  constructor(filterApplicatorMap, domainQuery) {
    this.domainQuery = domainQuery
    this.filterApplicatorMap = filterApplicatorMap
  }
  applyFilter = (query) => {
    return this.domainQuery.filters?.reduce(
      (q, filter) =>
        this.filterApplicatorMap[filter.type](filter).applyFilter(q),
      query
    )
  }
}

export class MongoDataQuery<TDomain extends Domain>
  implements IConvertToDataQuery<TDomain, MongoQuery> {
  private filterApplicators: IApplyFilterToQuery<MongoFilter<TDomain>>[]
  private table: string
  constructor(table, filterApplicators) {
    this.table = table
    this.filterApplicators = filterApplicators
  }
  toDataQuery = (query: DomainQuery<TDomain>): MongoQuery => {
    const intermediateQuery: MongoFilter<TDomain> = this.filterApplicators.reduce(
      (q, { applyFilter }) => applyFilter(q),
      {}
    )

    return (db) => {
      return db.collection(this.table).find(intermediateQuery).toArray()
    }
  }
}

export class QueryMongo implements IExecuteDataQuery<MongoQuery> {
  private client

  constructor(client) {
    this.client = client
  }

  executeQuery = (query) => {
    return query(this.client)
  }
}
