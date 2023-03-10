import themeFunction, { light, dark } from "@ha/themes-slate"
import { HeadersFunction, json } from "@remix-run/node"
import { LiveReload, Outlet, Scripts, useLoaderData } from "@remix-run/react"
import { ThemeProvider } from "styled-components"

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

const App = () => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>Gaming Remote</title>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      {typeof document === "undefined" ? "__STYLES__" : null}
      {typeof document === "undefined" ? "__INITIAL_DATA__" : null}
    </head>
    <body>
      <ThemeProvider theme={themeFunction(light, dark)}>
        <Outlet />
      </ThemeProvider>
      <Scripts />
      <LiveReload />
    </body>
  </html>
)

export default App
export { headers, loader }
