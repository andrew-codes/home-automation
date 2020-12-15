import createDebug from "debug"
import { defaultTo, flatten, isEmpty, isObject } from "lodash"
import { get } from "lodash/fp"
import { QueryParseError } from "./Errors"

const debug = createDebug("@ha/graphql-api/data-provider/sql")

const getOperator = (filter) => {
  if (filter.type === "equality") {
    if (Array.isArray(filter.value)) {
      if (filter.negation) {
        return "not in"
      } else {
        return "in"
      }
    }
    if (filter.negation) {
      return `<>`
    } else {
      return "="
    }
  }
}

const modifySqlQuery = (globalIndex = 0) => {
  const getSingleOperand = (index) => `$${globalIndex + index + 1}`
  const getOperand = (index, f) =>
    Array.isArray(f.value)
      ? `(${f.value.map((value, valueIndex) =>
          getSingleOperand(valueIndex + index)
        )})`
      : getSingleOperand(index)

  return (sql, filter, index) =>
    `${sql} ${index === 0 ? "WHERE" : "AND"} ${toColumnName(
      filter.attribute
    )} ${getOperator(filter)} ${getOperand(index, filter)}`
}

const toColumnName = (name) => {
  const isReservedExp = /(name)|(value)|(state)|(status|owner)/
  if (isReservedExp.test(name)) {
    return `"${name}"`
  }
  return name
}

const toInsertSql = (query) => {
  if (!query.select) {
    throw new QueryParseError(
      "select is required when act is set to a value",
      query
    )
  }

  if (isEmpty(query.values)) {
    throw new QueryParseError(
      "values are required when act is set to a value",
      query
    )
  }
  const selectFields = query.select.map(toColumnName).join(",")
  return `INSERT INTO ${
    query.from
  } (${selectFields}) VALUES (${query.select
    .map((s, index) => `$${index + 1}`)
    .join(",")}) ON CONFLICT (id) DO UPDATE SET ${query.select
    .map((s, index) => `${toColumnName(s)}=$${index + 1}`)
    .join(",")} RETURNING ${selectFields};`
}

const toUpdateSql = (query) => {
  if (!query.select) {
    throw new QueryParseError(
      "select is required when act is set to a value",
      query
    )
  }

  if (!query.values) {
    throw new QueryParseError(
      "values are required when act is set to a value",
      query
    )
  }
  const values = query.select.map(
    (s, index) => `${toColumnName(s)}=$${index + 1}`
  )
  const updateSql = `UPDATE ${query.from} SET ${values}`
  const filters = defaultTo(query.filters, [])
  const output = `${filters.reduce(
    modifySqlQuery(query.select.length),
    updateSql
  )} RETURNING ${query.select.map(toColumnName).join(",")};`
  return output
}

const toSelectSql = (query) => {
  const select = defaultTo(query.select, ["*"])
  if (!select.includes("*") && !select.includes("id")) {
    select.push("id")
  }
  const selectFields = select.map(toColumnName).join(",")

  const initialSql = `SELECT ${selectFields} FROM ${query.from}`
  const filters = defaultTo(query.filters, [])
  const selectSql = `${filters.reduce(modifySqlQuery(), initialSql)};`

  return selectSql
}

const toDeleteSql = (query) => {
  return `${(query.filters || []).reduce(
    modifySqlQuery(),
    `DELETE FROM ${query.from}`
  )};`
}

const toSql = (query) => {
  if (!query.act) {
    return toSelectSql(query)
  }
  if (query.act === "new") {
    return toInsertSql(query)
  }

  if (query.act === "set") {
    return toUpdateSql(query)
  }

  if (query.act === "remove") {
    return toDeleteSql(query)
  }
  throw new QueryParseError("Unrecognized query")
}

const createDataProvider = ({ executeQuery }) => {
  const recognizedDomainQuery = executeQuery(`SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;`)
  const query = async (q) => {
    if (!q) {
      throw new QueryParseError("query parameter is required")
    }
    const recognizedDomains = await recognizedDomainQuery
    debug(recognizedDomains, q)
    if (!recognizedDomains.map(get("table_name")).includes(q.from)) {
      return []
    }
    let sql
    try {
      sql = toSql(q)
    } catch (error) {
      if (error.name === "QueryParseError") {
        throw error
      }
      return []
    }

    const filterValues = defaultTo(q.filters, []).map(({ value }) => value)
    let values = []
    if (Array.isArray(q.values)) {
      values = q.values.map((v) => q.select.map((s) => v[s]))
    } else if (isObject(q.values)) {
      values = [q.select.map((s) => q.values[s])]
    }
    let queries = []
    if (q.act === "new" || q.act === "set") {
      queries = values.map((v) => flatten(v.concat(filterValues)))
    } else {
      queries = [flatten(values.concat(filterValues))]
    }
    const output = await Promise.all(
      queries.map(async (queryValues) => {
        debug(sql, queryValues)
        return executeQuery(sql, queryValues)
      })
    )
    if (output.length == 1 && Array.isArray(output[0])) {
      return output[0]
    }
    return output
  }

  return {
    query,
  }
}

export { createDataProvider }
