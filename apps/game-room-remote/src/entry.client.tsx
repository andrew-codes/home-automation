import { hydrate } from "react-dom"
import { RemixBrowser } from "@remix-run/react"
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"

const client = new ApolloClient({
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      )
    },
    new GraphQLWsLink(
      createClient({ url: `wss://graph-sub.smith-simms.family/graphql` }),
    ),
    createHttpLink({
      uri: `https://graph.smith-simms.family/graphql`,
    }),
  ),
  cache: new InMemoryCache().restore(
    typeof document !== "undefined"
      ? (window as unknown as any).__APOLLO_STATE__
      : {},
  ),
})

hydrate(
  <ApolloProvider client={client}>
    <RemixBrowser />
  </ApolloProvider>,
  document,
)
