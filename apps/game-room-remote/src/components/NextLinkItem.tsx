import * as React from "react"
import Link from "next/link"
import styled from "styled-components"
import { CustomItemComponentProps } from "@atlaskit/side-navigation"
import { useRouter } from "next/router"

const Anchor = styled.a`
  ${({ isSelected }) =>
    isSelected ? `--ds-text-subtlest: var(--dark-gray) !important;` : ""}
  --ds-background-neutral-subtle-hovered: var(--button-background-color) !important;
  --ds-background-neutral-subtle-pressed: var(--border-color) !important;
`

type CustomProps = CustomItemComponentProps & { href: string }

const NextLinkItem = React.forwardRef<HTMLAnchorElement, CustomProps>(
  (props: CustomProps, ref) => {
    const { children, href, ...rest } = props
    const router = useRouter()
    const isSelected = router.route === href

    return (
      <Link href={href} passHref={true}>
        <Anchor ref={ref} {...rest} isSelected={isSelected}>
          {children}
        </Anchor>
      </Link>
    )
  },
)

export default NextLinkItem
