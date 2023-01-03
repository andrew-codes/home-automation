import { GraphQLClient } from "graphql-request"
import getHost from "./getGraphHost"
import jsonParser from "./jsonParser"

let client

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
