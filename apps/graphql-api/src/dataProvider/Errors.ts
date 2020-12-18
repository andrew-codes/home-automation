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

export class UnSupportedFiltersError<TDomain extends Domain> extends Error {
  filters: FilterDefinition<TDomain>[]

  constructor(message: string, filters: FilterDefinition<TDomain>[]) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.filters = filters
  }
}

export class UnsupportedDomainError extends Error {
  from: Domain

  constructor(q) {
    super("Unsupported domain for provider")
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.from = q.domain
  }
}

export class ItemNotFoundByIdError extends Error {
  id: string

  constructor(id, message?: string) {
    super(message || "Not found")
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.id = id
  }
}
