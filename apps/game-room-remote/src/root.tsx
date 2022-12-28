import themeFunction, { light, dark } from "@ha/themes-slate"
import { LiveReload, Outlet, Scripts } from "@remix-run/react"
import { ThemeProvider } from "styled-components"

export default function App() {
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
        </ThemeProvider>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
