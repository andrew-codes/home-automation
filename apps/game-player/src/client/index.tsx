import * as React from "react"
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client"
import { getMainDefinition } from "@apollo/client/utilities"
import { render } from "react-dom"
import { setContext } from "@apollo/client/link/context"
import { WebSocketLink } from "@apollo/client/link/ws"
import { App } from "./App"
import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core"

async function run() {
  const apiUrlResp = await fetch("/apiUrl")
  const apiDetails = await apiUrlResp.json()

  const httpLink = createHttpLink({
    uri: `http://${apiDetails.url}`,
  })
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${apiDetails.token}`,
    },
  }))

  const wsLink = new WebSocketLink({
    uri: `ws://${apiDetails.subUrl}`,
    options: {
      timeout: 30000,
      reconnect: true,
    },
  })

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      )
    },
    wsLink,
    authLink.concat(httpLink)
  )

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  })

  const theme = createMuiTheme({
    overrides: {
      MuiCssBaseline: {
        "@global": {
          body: {
            Margin: 0,
          },
        },
      },
    },
  })

  const appEl = document.getElementById("app")
  render(
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ApolloProvider>,
    appEl
  )
}

run()

if (module.hot) {
  module.hot.accept()
}
