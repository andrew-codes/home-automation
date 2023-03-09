import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client"

const GraphqlProvider = ({ children, uri, initialState }) => {
  const link = createHttpLink({
    uri,
  })

  const client = new ApolloClient({
    cache: new InMemoryCache().restore(initialState),
    link,
    ssrForceFetchDelay: 100,
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default GraphqlProvider
