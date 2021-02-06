import * as React from "react"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import { render } from "react-dom"
import { App } from "./App"

const client = new ApolloClient({
  uri: "/api",
  cache: new InMemoryCache(),
})

const appEl = document.getElementById("app")
render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  appEl
)
