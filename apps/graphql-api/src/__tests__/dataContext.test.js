jest.mock("../dataProvider/aggregate", () => ({
  createDataProvider: jest.fn(),
}))
jest.mock("../dataProvider/batch", () => ({
  createDataProvider: jest.fn(),
}))
jest.mock("../dataProvider/homeAssistant", () => ({
  createDataProvider: jest.fn(),
}))
jest.mock("../dataProvider/sql", () => ({
  createDataProvider: jest.fn(),
}))
jest.mock("pg", () => {
  const mockPool = {
    connect: jest
      .fn()
      .mockResolvedValue({ query: jest.fn(), release: jest.fn() }),
  }
  return { Pool: jest.fn(() => mockPool) }
})
import { Pool } from "pg"
import { createDataContext } from "../dataContext"
import { createDataProvider as createAggregateProvider } from "../dataProvider/aggregate"
import { createDataProvider as createBatchProvider } from "../dataProvider/batch"
import { createDataProvider as createHaProvider } from "../dataProvider/homeAssistant/homeAssistant"
import { createDataProvider as createSqlProvider } from "../dataProvider/sql"

let client
beforeEach(async () => {
  jest.clearAllMocks()
  const pool = new Pool()
  client = await pool.connect()
})

test("batched sql queries and ha queries are aggregated", async () => {
  const expectedResultSet = { id: "Game:1" }
  const aggregateProvider = {
    query: jest.fn().mockReturnValue(expectedResultSet),
  }
  const batchSqlProvider = { query: jest.fn() }
  const batchHaProvider = { query: jest.fn() }
  const haProvider = { query: jest.fn() }
  const sqlProvider = createSqlProvider()
  createAggregateProvider.mockReturnValue(aggregateProvider)
  createBatchProvider.mockReturnValueOnce(batchSqlProvider)
  createBatchProvider.mockReturnValueOnce(batchHaProvider)
  createHaProvider.mockReturnValue(haProvider)
  const query = { from: "game" }

  const sut = createDataContext()
  const actual = await sut.query(query)

  expect(createBatchProvider).toHaveBeenCalledWith({ loader: sqlProvider })
  expect(createAggregateProvider).toHaveBeenCalledTimes(1)
  expect(createAggregateProvider).toHaveBeenCalledWith([
    batchSqlProvider,
    batchHaProvider,
  ])
  expect(aggregateProvider.query).toHaveBeenCalledTimes(1)
  expect(actual).toEqual(expectedResultSet)
})

test("sql query provider is connected to postgres", async () => {
  createDataContext()
  const sql = "SELECT *"
  const values = ["v1", 2]
  const expectedResultSet = [{ id: "Game:1" }]
  client.query.mockResolvedValue({ rows: expectedResultSet })
  const actual = await createSqlProvider.mock.calls[0][0].executeQuery(
    sql,
    values
  )
  expect(client.query).toHaveBeenCalledTimes(1)
  expect(client.query).toHaveBeenCalledWith(sql, values)
  expect(actual).toEqual(expectedResultSet)
  expect(client.release).toHaveBeenCalledTimes(1)
})

test("sql client is released even when errors are thrown and returns empty result set", async () => {
  createDataContext()
  const sql = "SELECT *"
  const values = ["v1", 2]
  client.query.mockImplementation(() => {
    throw new Error()
  })
  const actual = await createSqlProvider.mock.calls[0][0].executeQuery(
    sql,
    values
  )
  expect(client.release).toHaveBeenCalledTimes(1)
  expect(actual).toEqual([])
})

test("thrown provider errors return an empty result set", async () => {
  const aggregateProvider = {
    query: jest.fn().mockImplementation(() => {
      throw new Error()
    }),
  }
  createAggregateProvider.mockReturnValue(aggregateProvider)
  const query = { from: "game" }

  const sut = createDataContext()
  const actual = await sut.query(query)

  expect(actual).toEqual([])
})
