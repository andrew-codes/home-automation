import * as React from "react"
import styled from "styled-components"

const StyledText = styled.span`
  font-family: Open-Sans, Helvetica, Sans-Serif;
`

type TextProps<T> = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | T
}

const Text = <T extends TextProps<T>>(props: T): React.ReactElement<T> => (
  <StyledText {...props} />
)
Text.defaultProps = { as: "p" }

export default Text
