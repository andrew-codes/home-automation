jest.mock("mongodb")
import { MongoClient } from "mongodb"

beforeEach(() => {
  jest.resetAllMocks()
})

test("mongo client is created with the correct connection string and connected", () => {
  process.env = {
    MONGO_INITDB_ROOT_PASSWORD: "password",
    MONGO_INITDB_ROOT_USERNAME: "username",
    MONGODB_HOST: "host",
    MONGODB_PORT: "80",
  }
  const connect = jest.fn()
  MongoClient.mockReturnValue({
    connect,
  })
  const { client } = require("../mongo")
  expect(MongoClient).toHaveBeenCalledWith(
    "mongodb://username:password@host:80"
  )
  expect(connect).toHaveBeenCalled()
})
