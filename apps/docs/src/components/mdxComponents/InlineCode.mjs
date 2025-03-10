import { useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { Highlight } from "prism-react-renderer"
import React from "react"

const Code = styled("code")`
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #c6bfcd;
  font-family: monospace;
  font-size: 0.9375em;
  padding: 2px 6px;
`

const InlineCode = (props) => {
  const theme = useTheme()

  return (
    <Highlight code={props.children} theme={theme?.code} language="plaintext">
      {({ className, style }) => (
        <Code className={className} style={style}>
          {props.children}
        </Code>
      )}
    </Highlight>
  )
}

export { InlineCode }
