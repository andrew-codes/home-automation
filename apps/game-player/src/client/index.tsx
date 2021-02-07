import * as React from "react"
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client"
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

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  })

  // const wsLink = new WebSocketLink({
  //   uri: `ws://${apiDetails.subUrl}/`,
  //   options: {
  //     reconnect: true,
  //     connectionParams: {
  //       authToken: apiDetails.token,
  //     },
  //   },
  // })

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
