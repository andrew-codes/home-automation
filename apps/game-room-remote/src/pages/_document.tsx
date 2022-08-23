import * as React from "react"
import Document, { Head, Html, Main, NextScript } from "next/document"
import { ServerStyleSheet, ThemeProvider } from "styled-components"
import themeFunction, { light, dark } from "@ha/themes-slate"

class MyDocument extends Document<{ styleTags: any }> {
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet()

    const page = renderPage(
      (App) => (props) => sheet.collectStyles(<App {...props} />),
    )

    const styleTags = sheet.getStyleElement()

    return { ...page, styleTags }
  }

  render() {
    return (
      <Html>
        <Head>{this.props.styleTags}
          <title>Game Room Remote</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <body>
          <ThemeProvider theme={themeFunction(light, dark)}>
            <Main />
          </ThemeProvider>
          <NextScript />
        </body>
      </Html>
    )
  }
}
export default MyDocument
