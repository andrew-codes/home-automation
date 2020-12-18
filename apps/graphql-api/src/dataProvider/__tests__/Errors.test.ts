import { equality } from "../../filter"
import {
  QueryParseError,
  UnSupportedFiltersError,
  UnsupportedDomainError,
  ItemNotFoundByIdError,
} from "./../Errors"

test("QueryParseError", () => {
  const query = {
    from: "area",
    filters: [{ type: "unknown", attribute: "id" }],
  }
  const actual = new QueryParseError(query)

  expect(actual.query).toEqual(query)
  expect(actual.message).toBeDefined()
  expect(actual.stack).toBeDefined()
})

test("UnSupportedFiltersError", () => {
  const query = {
    from: "area",
    filters: [equality("name", "a name")],
  }
  const actual = new UnSupportedFiltersError(query.filters)

  expect(actual.filters).toEqual(query.filters)
  expect(actual.message).toBeDefined()
  expect(actual.stack).toBeDefined()
})

test("UnsupportedDomainError", () => {
  const query = {
    from: "area",
    filters: [{ type: "unknown", attribute: "id" }],
  }
  const actual = new UnsupportedDomainError(query)

  expect(actual.domain).toEqual(query.from)
  expect(actual.message).toBeDefined()
  expect(actual.stack).toBeDefined()
})

test("ItemNotFoundByIdError", () => {
  const actual = new ItemNotFoundByIdError(1)

  expect(actual.id).toEqual(1)
  expect(actual.message).toBeDefined()
  expect(actual.stack).toBeDefined()
})
