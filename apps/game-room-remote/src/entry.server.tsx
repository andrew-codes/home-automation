import { flow } from "lodash/fp"
import type { EntryContext } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import { ServerStyleSheet } from "styled-components"
import fs from "fs/promises"
import { getDataFromTree } from "@apollo/client/react/ssr"
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
import { initial } from "lodash"

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: `${process.env.GRAPH_HOST}/graphql`,
    }),
    cache: new InMemoryCache(),
  })

  const sheet = new ServerStyleSheet()
  const App = sheet.collectStyles(
    <RemixServer context={remixContext} url={request.url} />,
  )

  const markup = await getDataFromTree(App)
  const initialState = client.extract()
  // const markup = renderToString(
  //   sheet.collectStyles(
  //     <RemixServer context={remixContext} url={request.url} />,
  //   ),
  // )

  const swiperCss = await fs.readFile(require.resolve("swiper/css"), "utf8")
  const swiperCssVirtual = await fs.readFile(
    require.resolve("swiper/css/virtual"),
    "utf8",
  )
  const effectCreative = await fs.readFile(
    require.resolve("swiper/css/effect-creative"),
    "utf8",
  )
  const swipeStyles = [swiperCss, swiperCssVirtual, effectCreative]

  const styles = sheet.getStyleTags()
  const processMarkup = flow(
    (markup) =>
      markup.replace(
        "__STYLES__",
        `${styles}
    <style>${swipeStyles.map((buffer) => buffer.toString()).join("")}}</style>`,
      ),
    (markup) =>
      markup.replace(
        "__INITIAL_DATA__",
        `<script>window.__APOLLO_STATE__ = ${JSON.stringify(
          initialState,
        ).replace(/</g, "\\u003c")};</script>`,
      ),
  )

  responseHeaders.set("Content-Type", "text/html")

  return new Response("<!DOCTYPE html>" + processMarkup(markup), {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
