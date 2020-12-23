import createDebug from "debug"
import redis from "async-redis"
import { createFilterApplicator } from "./filterApplicators/valueFilterApplicators"
import { Domain, DomainResults } from "../Domain"
import { IProvideData } from "./DataProvider"

const debug = createDebug("@ha/graphql-api/dataProvider/redis")

const createDataProvider = (options) => {
  debug(options)
  const redisClient = redis.createClient(6379, "redis")
  redisClient.on("error", function (err) {
    debug("redis error", err)
  })
  redisClient.on("ready", function () {
    debug("Connected")
  })
  redisClient.on("reconnecting", function () {
    debug("Reconnecting")
  })
  redisClient.on("warning", function (warning) {
    debug("warning", warning)
  })
  redisClient.on("end", function () {
    debug("end")
  })
  return <TDomain extends Domain>(
    key: string,
    transformFn: (
      item: object,
      index: number,
      list: object[]
    ) => DomainResults[TDomain],
    canExecuteQuery
  ): IProvideData => {
    return {
      canExecuteQuery,
      query: async (q) => {
        debug("here")
        const data = await redisClient.get(key)
        const domainData = JSON.parse(data)?.map(transformFn)
        const applyFilters = createFilterApplicator(q.filters)
        return applyFilters(domainData)
      },
    }
  }
}

export { createDataProvider }
