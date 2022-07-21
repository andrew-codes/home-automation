import * as React from "react"
import styled from "styled-components"
import AtlasKitButton, { ButtonProps } from "@atlaskit/button"

const StyledButton = styled(AtlasKitButton)`
  border: 1px solid var(--border-color) !important;
  background: var(--button-background-color) !important;
  color: var(--text-color);

  :active {
    background: var(--border-color) !important;
  }
`

const Button: React.FC<ButtonProps> = (props) => <StyledButton {...props} />

export default Button
