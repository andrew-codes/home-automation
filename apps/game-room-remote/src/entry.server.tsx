import { renderToString } from "react-dom/server"
import type { EntryContext } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import { ServerStyleSheet } from "styled-components"

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const sheet = new ServerStyleSheet()

  const markup = renderToString(
    sheet.collectStyles(
      <RemixServer context={remixContext} url={request.url} />,
    ),
  )
  const styles = sheet.getStyleTags()
  const markupWithStyles = markup.replace("__STYLES__", styles)

  responseHeaders.set("Content-Type", "text/html")

  return new Response("<!DOCTYPE html>" + markupWithStyles, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
