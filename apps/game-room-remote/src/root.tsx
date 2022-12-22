import themeFunction, { light, dark } from "@ha/themes-slate"
import { LiveReload, Outlet, Scripts } from "@remix-run/react"
import { ThemeProvider } from "styled-components"
import PrefetchGameLinks from "./components/PrefetchGameLinks"

import { LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { GraphQLError } from "graphql"
import { sendGraphQLRequest } from "remix-graphql/index.server"

type LoaderData = {
  data?: {
    games: { id: string; name: string; coverImage: string | null }[]
    releaseYear: number
  }
  errors?: GraphQLError[]
}

const gamesQuery = /* GraphQL */ `
  query Games {
    games {
      id
      name
      coverImage
      releaseYear
    }
  }
`

export const loader: LoaderFunction = (args) =>
  sendGraphQLRequest({
    // Pass on the arguments that Remix passes to a loader function.
    args,
    // Provide the endpoint of the remote GraphQL API.
    endpoint: process.env.GRAPHQL_HOST ?? "http://graph/graphql",
    // Optionally add headers to the request.
    // Provide the GraphQL operation to send to the remote API.
    query: gamesQuery,
    // Optionally provide variables that should be used for executing the
    // operation. If this is not passed, `remix-graphql` will derive variables
    // from...
    // - ...the route params.
    // - ...the submitted `formData` (if it exists).
    // That means the following is the default and could also be ommited.
    // variables: args.params,
  })

export default function App() {
  const { data } = useLoaderData<LoaderData>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Gaming Remote</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        {typeof document === "undefined" ? "__STYLES__" : null}
      </head>
      <body>
        <ThemeProvider theme={themeFunction(light, dark)}>
          <Outlet />
          <PrefetchGameLinks games={data?.games ?? []} />
        </ThemeProvider>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
