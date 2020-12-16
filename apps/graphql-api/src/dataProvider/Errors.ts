import { Domain, DomainQuery } from "../Domain"
import { FilterDefinition } from "../filter/filter"

export class QueryParseError<TDomain extends Domain> extends Error {
  query: DomainQuery<TDomain>

  constructor(message: string, query) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.query = query
  }
}

export class UnSupportedFilters extends Error {
  filters: Array<FilterDefinition>

  constructor(message: string, filters) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.filters = filters
  }
}
