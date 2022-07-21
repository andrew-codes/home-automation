import * as React from "react"
import styled, { createGlobalStyle } from "styled-components"
import { useRouter } from "next/router"
import { Content, LeftSidebar, Main, PageLayout } from "@atlaskit/page-layout"
import {
  NavigationContent,
  CustomItem,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation"
import NextLinkItem from "./NextLinkItem"
import Filters from "./Filters"

const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  padding: 0;
  --dark-gray: rgb(39,40,38);
  --dark-slate-gray: #0d1117;
  --side-bar-color: #161b22;
  --button-background-color: #21262d;
  --off-white: rgba(240,246,252,0.1);
  --border-color: rgba(240,246,252,0.1);

  --ds-surface: var(--dark-slate-gray);
  --text-color: #c9d1d9;
  --text-subtle-color: var(--dark-slate-gray);
  --text-muted-color: #8b949e;
  background: var(--dark-slate-gray);
  color: var(--text-color);
  --ds-text: var(--text-color);
  --ds-text-subtlest: var(--text-muted-color);
  --ds-text-subtle: var(--text-color);
  --ds-background-neutral-subtle-hovered: var(--dark-gray);
}
#__next {
  height: 100vh;
}

[data-resize-button] {
  color: var(--dark-slate-gray) !important;
}
`

const Sidebar = styled.div`
  height: 100%;
  --ds-surface: var(--side-bar-color);
`
const NavBorder = styled(Sidebar)`
  border-right: 1px solid var(--border-color);
`

const NavLayout = styled.div`
  height: 100% !important;
  flex-direction: column;
  display: flex;
  background: var(--side-bar-color);
  > * {
    height: unset !important;
  }
  > *:last-child {
    flex: 1;
  }
`

const MainContent = styled.div`
  padding: 40px;
`

const NowPlayingSummary = styled.div`
  margin: 18px;
  min-height: 64px;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;

  img {
    height: 64px;
    width: 64px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  > *:not(img) {
    padding-top: 12px;
    padding-left: 18px;
  }
`

function Layout({ children }) {
  const router = useRouter()
  const [isLeftNavReady, setIsLeftNavReady] = React.useState(
    router.route === "/browse",
  )
  React.useEffect(() => {
    if (window.innerWidth < 600) {
      const dsPageLayoutState: any =
        JSON.parse(localStorage.getItem("DS_PAGE_LAYOUT_UI_STATE") ?? "{}") ??
        {}

      dsPageLayoutState.isLeftSidebarCollapsed = true
      dsPageLayoutState.gridState.leftSidebarWidth = 20
      localStorage.setItem(
        "DS_PAGE_LAYOUT_UI_STATE",
        JSON.stringify(dsPageLayoutState),
      )
    }
    setIsLeftNavReady(true)
  }, [])

  return (
    <>
      <GlobalStyle />
      {isLeftNavReady && (
        <PageLayout>
          <Content>
            <NavBorder>
              <LeftSidebar width={350}>
                <SideNavigation label="Game Room Navigation">
                  <NavLayout>
                    <NavigationContent>
                      <Section>
                        <NowPlayingSummary>
                          <img />
                          <span>Nothing playing</span>
                        </NowPlayingSummary>
                        {router.route !== "/" && (
                          <CustomItem href="/" component={NextLinkItem}>
                            Back
                          </CustomItem>
                        )}
                        {router.route === "/" && (
                          <CustomItem href="/browse" component={NextLinkItem}>
                            Browse
                          </CustomItem>
                        )}
                      </Section>
                      {router.route === "/browse" && <Filters />}
                    </NavigationContent>
                  </NavLayout>
                </SideNavigation>
              </LeftSidebar>
            </NavBorder>
            <Main>
              <MainContent>{children}</MainContent>
            </Main>
          </Content>
        </PageLayout>
      )}
    </>
  )
}

export default Layout
