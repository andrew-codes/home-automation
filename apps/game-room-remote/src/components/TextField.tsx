import * as React from "react"
import styled from "styled-components"
import AtlasKitTextField, { TextFieldProps } from "@atlaskit/textfield"

const StyledTextField = styled(AtlasKitTextField)`
  border-radius: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  border-top: 0 !important;
  --ds-border: var(--border-color);
  --input-hovered-background-color: var(--border-color);
`

const TextField: React.FC<TextFieldProps> = (props) => (
  <StyledTextField {...props} />
)

export default TextField
