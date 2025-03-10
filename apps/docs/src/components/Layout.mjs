import styled from "@emotion/styled"
import { MDXProvider } from "@mdx-js/react"
import * as React from "react"
import config from "../../config.mjs"
import mdxComponents from "./mdxComponents/index.mjs"
import Sidebar from "./rightSidebar.mjs"
import LeftSideBar from "./sidebar/index.mjs"
import ThemeProvider from "./theme/themeProvider.mjs"

const Wrapper = styled("div")`
  display: flex;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background};

  .sideBarUL li a {
    color: ${({ theme }) => theme.colors.text};
  }

  .sideBarUL .item > a:hover {
    background-color: #1ed3c6;
    color: #fff !important;

    /* background: #F8F8F8 */
  }

  @media only screen and (max-width: 767px) {
    display: block;
  }
`

const Content = styled("main")`
  display: flex;
  flex-grow: 1;
  margin: 0px 88px;
  padding-top: 3rem;
  background: ${({ theme }) => theme.colors.background};

  @media only screen and (max-width: 1023px) {
    padding-left: 0;
    margin: 0 10px;
    padding-top: 3rem;
  }
`

const MaxWidth = styled("div")`
  @media only screen and (max-width: 50rem) {
    width: 100%;
    position: relative;
  }
`

const LeftSideBarWidth = styled("div")`
  width: 298px;
`

const RightSideBarWidth = styled("div")`
  width: 224px;
`

const Layout = ({ children, location }) => (
  <ThemeProvider location={location}>
    <MDXProvider components={mdxComponents}>
      <Wrapper>
        <LeftSideBarWidth className={"hiddenMobile"}>
          <LeftSideBar location={location} />
        </LeftSideBarWidth>
        {config.sidebar.title ? (
          <div
            className={"sidebarTitle sideBarShow"}
            dangerouslySetInnerHTML={{ __html: config.sidebar.title }}
          />
        ) : null}
        <Content>
          <MaxWidth>{children}</MaxWidth>
        </Content>
        <RightSideBarWidth className={"hiddenMobile"}>
          <Sidebar location={location} />
        </RightSideBarWidth>
      </Wrapper>
    </MDXProvider>
  </ThemeProvider>
)

export default Layout
