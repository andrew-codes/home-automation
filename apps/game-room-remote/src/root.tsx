import themeFunction, { light, dark } from "@ha/themes-slate"
import { HeadersFunction, json, LoaderArgs } from "@remix-run/node"
import { LiveReload, Outlet, Scripts, useLoaderData } from "@remix-run/react"
import { graphql } from "graphql"
import { ThemeProvider } from "styled-components"
import GraphqlProvider from "./components/GraphqlProvider"

const headers: HeadersFunction = () => {
  let cacheControlHeader = "public, s-maxage=60"
  if (process.env.NODE_ENV === "development") {
    cacheControlHeader = "no-cache"
  }

  return {
    "Cache-Control": cacheControlHeader,
  }
}

const loader = async () => {
  return json({ graphqlUri: `${process.env.GRAPH_HOST}/graphql` })
}

const App = () => {
  const { graphqlUri } = useLoaderData()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Gaming Remote</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        {typeof document === "undefined" ? "__STYLES__" : null}
        {typeof document === "undefined" ? "__INITIAL_DATA__" : null}
      </head>
      <body>
        <GraphqlProvider
          uri={graphqlUri}
          initialState={
            typeof document !== "undefined"
              ? (window as unknown as any).__APOLLO_STATE__
              : {}
          }
        >
          <ThemeProvider theme={themeFunction(light, dark)}>
            <Outlet />
          </ThemeProvider>
        </GraphqlProvider>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default App
export { headers, loader }
