import * as React from "react"
import styled, { createGlobalStyle } from "styled-components"
import { useRouter } from "next/router"
import { Content, LeftSidebar, Main, PageLayout } from "@atlaskit/page-layout"
import NextLinkItem from "./NextLinkItem"
import {
  CustomItem,
  Header,
  NavigationContent,
  NavigationHeader,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation"
import Button from "@atlaskit/button"
import TextField from "@atlaskit/textfield"
import Form, { CheckboxField, Field, Fieldset } from "@atlaskit/form"
import { Checkbox } from "@atlaskit/checkbox"
import Toggle from "@atlaskit/toggle"

const GlobalStyle = createGlobalStyle`
body {
  font-family: Open-Sans, Helvetica, Sans-Serif;
  margin: 0;
  padding: 0;
  --dark-gray: rgb(39,40,38);
  --dark-slate-gray: rgb(32,32,35);
  --off-white: rgb(204,207,194);
  --ds-surface: var(--dark-slate-gray);
  background: var(--dark-slate-gray);
  color: var(--off-white);
  --ds-text: var(--off-white);
  --ds-text-subtlest: var(--off-white);
  --ds-text-subtle: var(--off-white);
  --ds-background-neutral-subtle-hovered: var(--dark-gray);
}
#__next {
  height: 100vh;
}
`
const NavBorder = styled.div`
  border-right: 1px solid rgb(88, 89, 86);
  height: 100%;
`
const NavLayout = styled.div`
  height: 100% !important;
  flex-direction: column;
  display: flex;
  > * {
    height: unset !important;
  }
  > *:last-child {
    flex: 1;
  }
`
const FindFilters = styled.div`
  padding: 0 10px;
  --ds-background-input: var(--dark-slate-gray);
  --ds-background-input-hovered: var(--dark-gray);
  --ds-background-input-pressed: var(--dark-gray);
  [data-ds--text-field--container] {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-top: 0;
  }
  > * {
    margin-top: 12px;
  }
`

function Layout({ children }) {
  const router = useRouter()

  return (
    <>
      <GlobalStyle />
      <PageLayout>
        <Content>
          <NavBorder>
            <LeftSidebar width={350}>
              <SideNavigation label="Game Room Navigation">
                <NavigationHeader>
                  <Header>Game Room</Header>
                </NavigationHeader>
                <NavLayout>
                  <NavigationContent>
                    <Section title="Find an Activity">
                      <CustomItem
                        isSelected={router.asPath === "/recent"}
                        href="/recent"
                        component={NextLinkItem}
                      >
                        Recent
                      </CustomItem>
                      <CustomItem
                        isSelected={router.asPath === "/browse"}
                        description="Search and filter activities"
                        href="/browse"
                        component={NextLinkItem}
                      >
                        Browse
                      </CustomItem>
                    </Section>
                    {router.asPath === "/browse" && (
                      <Section title="Filter">
                        <FindFilters>
                          <Fieldset legend="Search">
                            <Field name="search">
                              {({ fieldProps }: any) => (
                                <TextField
                                  placeholder="by title"
                                  {...fieldProps}
                                />
                              )}
                            </Field>
                          </Fieldset>
                          <Fieldset legend="Platform">
                            <div>
                              <Toggle size="large" /> Watch TV or Movies
                            </div>
                            <div>
                              <Toggle size="large" /> PC
                            </div>
                            <div>
                              <Toggle size="large" /> PlayStation
                            </div>
                          </Fieldset>
                          <Fieldset legend="Co-op / Multiplayer">
                            <div>
                              <Toggle size="large" /> Single
                            </div>
                            <div>
                              <Toggle size="large" /> Local
                            </div>
                            <div>
                              <Toggle size="large" /> Online
                            </div>
                          </Fieldset>

                          <Button shouldFitContainer appearance="subtle">
                            Clear
                          </Button>
                        </FindFilters>
                      </Section>
                    )}
                  </NavigationContent>
                </NavLayout>
              </SideNavigation>
            </LeftSidebar>
          </NavBorder>
          <Main>{children}</Main>
        </Content>
      </PageLayout>
    </>
  )
}

export default Layout
