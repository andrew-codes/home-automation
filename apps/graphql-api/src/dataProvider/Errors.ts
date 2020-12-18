import { Domain, DomainQuery } from "../Domain"
import { FilterDefinition } from "../filter/filter"

export class QueryParseError<TDomain extends Domain> extends Error {
  query: DomainQuery<TDomain>

  constructor(query) {
    super("Query Parse Error")
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.query = query
  }
}

export class UnSupportedFiltersError<TDomain extends Domain> extends Error {
  filters: FilterDefinition<TDomain>[]

  constructor(filters: FilterDefinition<TDomain>[]) {
    super("Unsupported Filter(s)")
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.filters = filters
  }
}

export class UnsupportedDomainError extends Error {
  domain: Domain

  constructor(q) {
    super("Unsupported domain for provider")
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.domain = q.from
  }
}

export class ItemNotFoundByIdError extends Error {
  id: string

  constructor(id) {
    super("Item not found by ID")
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.id = id
  }
}
