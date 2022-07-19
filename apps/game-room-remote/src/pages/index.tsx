import * as React from "react"
import styled, { createGlobalStyle } from "styled-components"
import {
  Content,
  LeftSidebarWithoutResize,
  Main,
  PageLayout,
  useLeftSidebarFlyoutLock,
} from "@atlaskit/page-layout"
import {
  ButtonItem,
  Header,
  NavigationContent,
  NavigationHeader,
  NestableNavigationContent,
  NestingItem,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation"

const GlobalStyle = createGlobalStyle`
body {
  font-family: Open-Sans, Helvetica, Sans-Serif;
  margin: 0;
  padding: 0;
  background: rgb(39,40,38);
  --ds-surface: rgb(39,40,38);
  color: rgb(204,207,194);
  --ds-text: rgb(204,207,194);
  --ds-text-subtlest: rgb(204,207,194);
}
#__next {
  height: 100vh;
}
`
const NavBorder = styled.div`
  border-right: 1px solid rgb(88, 89, 86);
`

function Index() {
  return (
    <>
      <GlobalStyle />
      <PageLayout>
        <Content>
          <NavBorder>
            <LeftSidebarWithoutResize width={350}>
              <SideNavigation label="Game Room Navigation">
                <NavigationHeader>
                  <Header>Game Room</Header>
                </NavigationHeader>
                <NavigationContent>
                  <Section title="Find">
                    <ButtonItem>Search</ButtonItem>
                  </Section>
                </NavigationContent>
              </SideNavigation>
            </LeftSidebarWithoutResize>
          </NavBorder>
          <Main>
            <div>Hello</div>
          </Main>
        </Content>
      </PageLayout>
    </>
  )
}

export default Index
