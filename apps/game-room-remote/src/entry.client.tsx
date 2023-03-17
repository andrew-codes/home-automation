import { hydrate } from "react-dom"
import { RemixBrowser } from "@remix-run/react"
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client"

const client = new ApolloClient({
  link: createHttpLink({
    uri: `https://graph.smith-simms.family/graphql`,
  }),
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
