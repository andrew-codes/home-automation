import { GraphQLClient } from "graphql-request"
import getHost from "./getGraphHost"

let client

const dateFormat = /[1-2]\d{3}-[0-1][0-9]-[0-3][0-9]T/
const jsonReviver = (key: string, value: any) => {
  if (typeof value !== "string") {
    return value
  }

  if (!dateFormat.test(value)) {
    return value
  }

  const parsedDate = Date.parse(value)
  if (Number.isNaN(parsedDate)) {
    return value
  }
  return new Date(parsedDate)
}

const jsonParser = (payload: string) => JSON.parse(payload, jsonReviver)

const getClient = (): GraphQLClient => {
  const host = getHost()
  if (!client) {
    client = new GraphQLClient(host, {
      errorPolicy: "ignore",
      jsonSerializer: { parse: jsonParser, stringify: JSON.stringify },
    })
  }

  return client
}

export default getClient
