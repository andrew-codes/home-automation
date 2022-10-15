import * as React from "react"
import styled from "styled-components"

const StyledText = styled.span`
  font-family: Open-Sans, Helvetica, Sans-Serif;
`

type TextProps = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
}

const Text: React.FC<TextProps> = (props) => <StyledText {...props} />

export default Text
