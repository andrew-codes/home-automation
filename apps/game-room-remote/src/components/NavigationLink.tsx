import { forwardRef } from "react"
import styled from "styled-components"
import { CustomItem, CustomItemComponentProps } from "@atlaskit/side-navigation"
import Text from "./Text"
import { useLocation } from "@remix-run/react"

const StyledAnchor = styled.a`
  color: ${({ active }) => (active ? "pink" : "currentColor")} !important;
  --ds-background-neutral-subtle-hovered: var(
    --button-background-color
  ) !important;
  --ds-background-neutral-subtle-pressed: var(--border-color) !important;
`

type CustomProps = CustomItemComponentProps & { href: string }

const Anchor = forwardRef<HTMLAnchorElement, CustomProps>(
  (props: CustomProps, ref) => {
    const { children, href, ...rest } = props

    const location = useLocation()

    return (
      <StyledAnchor
        {...rest}
        active={location.pathname === href}
        href={href}
        ref={ref}
      >
        <Text as="span">{children}</Text>
      </StyledAnchor>
    )
  },
)

const Link = (props) => <CustomItem {...props} component={Anchor} />

export default Link
