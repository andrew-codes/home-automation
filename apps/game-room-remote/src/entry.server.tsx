import { renderToString } from "react-dom/server"
import type { EntryContext } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import { ServerStyleSheet } from "styled-components"
import fs from "fs/promises"

export default async function handleRequest(
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
  const markupWithStyles = markup.replace(
    "__STYLES__",
    `${styles}
    <style>${swipeStyles.map((buffer) => buffer.toString()).join("")}}</style>`,
  )

  responseHeaders.set("Content-Type", "text/html")

  return new Response("<!DOCTYPE html>" + markupWithStyles, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
