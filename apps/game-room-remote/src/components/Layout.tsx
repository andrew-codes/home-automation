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
import Button from "@atlaskit/button"
import TextField from "@atlaskit/textfield"
import { CheckboxField, Field, Fieldset } from "@atlaskit/form"
import { Checkbox } from "@atlaskit/checkbox"
import NextLinkItem from "./NextLinkItem"

const GlobalStyle = createGlobalStyle`
body {
  font-family: Open-Sans, Helvetica, Sans-Serif;
  margin: 0;
  padding: 0;
  --dark-gray: rgb(39,40,38);
  --dark-slate-gray: #0d1117;
  --side-bar-color: #161b22;
  --button-background-color: #21262d;
  --off-white: rgba(240,246,252,0.1);
  --border-color: rgba(240,246,252,0.1);
  --input-hovered-background-color: var(--border-color);
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

button[class$="ButtonBase"] {
  border: 1px solid var(--border-color) !important;
  background: var(--button-background-color) !important;
  color: var(--text-color);
}
button[class$="ButtonBase"]:active {
  background: var(--border-color) !important;
}

[data-resize-button] {
  color: var(--dark-slate-gray) !important;
}

[data-ds--text-field--container] {
  border-radius: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  border-top: 0 !important;
  --ds-border: var(--border-color);
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
const FindFilters = styled.div`
  padding: 0 10px;
  --ds-background-neutral-subtle-hovered: var(--side-bar-color);
  --ds-background-input: var(--side-bar-color);
  --ds-background-input-hovered: var(--input-hovered-background-color);
  --ds-background-input-pressed: var(--input-hovered-background-color);
  --ds-border-color: var(--border-color);

  > * {
    margin-top: 12px;
  }
  fieldset {
    border-color: var(--border-color);
  }
  fieldset legend label {
    color: var(--text-muted-color) !important;
  }
`

const Chips = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  > * {
    margin: 0 16px;
  }
`
const Chip = styled(Button)`
  border-radius: 18px !important;
  text-align: center;
  min-width: 94px !important;
`

const MainContent = styled.div`
  padding: 40px;
`

const PlayCard = styled.div`
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

const getNewValue = (
  value: string | null,
  values: string | string[],
  selected: boolean,
): string | string[] | undefined => {
  if (Array.isArray(values)) {
    const newValues = values.filter((v) => v !== value)
    if (selected && !!value) {
      newValues.push(value)
    }
    return newValues
  }

  if (!value) {
    return undefined
  }

  return value
}

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

  const [query, setQuery] = React.useState(router.query)
  React.useEffect(() => {
    setQuery(router.query)
  }, [router.query])

  const handleClear = React.useCallback(() => {
    router.push("/browse?collection=all")
  }, [])

  const handleCheckboxChange = React.useCallback(
    (evt) => {
      let fieldValues: string[] = (query[evt.target.name] ?? []) as string[]
      if (!Array.isArray(fieldValues)) {
        fieldValues = [fieldValues]
      }
      const newQuery = query
      newQuery[evt.target.name] = getNewValue(
        evt.target.value,
        fieldValues,
        evt.target.checked,
      )
      const params = new URLSearchParams()
      Object.entries(newQuery)
        .filter(([key, value]) => !!value)
        .forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v))
          } else {
            params.append(key, ((value as any) ?? "").toString())
          }
        })
      router.push(`${router.route}?${params.toString()}`)
    },
    [query],
  )

  const handleCollectionChange = React.useCallback(
    (evt) => {
      const collection = evt.target.parentNode.name
      const newQuery = query
      newQuery.collection = getNewValue(collection, [], true)
      const params = new URLSearchParams()
      Object.entries(newQuery)
        .filter(([key, value]) => !!value)
        .forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v))
          } else {
            params.append(key, ((value as any) ?? "").toString())
          }
        })
      router.push(`${router.route}?${params.toString()}`)
    },
    [query],
  )

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
                        <PlayCard>
                          <img />
                          <span>Nothing playing</span>
                        </PlayCard>
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
                      {router.route === "/browse" && (
                        <>
                          <Section>
                            <Chips>
                              <Chip
                                name="recent"
                                onClick={handleCollectionChange}
                              >
                                recent
                              </Chip>
                              <Chip name="all" onClick={handleCollectionChange}>
                                all
                              </Chip>
                            </Chips>
                          </Section>
                          <Section>
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
                                <CheckboxField name="platform">
                                  {(fieldProps) => (
                                    <Checkbox
                                      {...fieldProps}
                                      label="TV or Movies"
                                      value="tv"
                                      isChecked={
                                        !!router.query.platform?.includes("tv")
                                      }
                                      size="large"
                                      name="platform"
                                      onChange={handleCheckboxChange}
                                    />
                                  )}
                                </CheckboxField>
                                <CheckboxField name="platform">
                                  {(fieldProps) => (
                                    <Checkbox
                                      label="PC"
                                      value="pc"
                                      name="platform"
                                      isChecked={
                                        !!router.query.platform?.includes("pc")
                                      }
                                      onChange={handleCheckboxChange}
                                      size="large"
                                    />
                                  )}
                                </CheckboxField>
                                <CheckboxField name="platform">
                                  {(fieldProps) => (
                                    <Checkbox
                                      {...fieldProps}
                                      label="PlayStation"
                                      value="playstation"
                                      size="large"
                                      isChecked={
                                        !!router.query.platform?.includes(
                                          "playstation",
                                        )
                                      }
                                      name="platform"
                                      onChange={handleCheckboxChange}
                                    />
                                  )}
                                </CheckboxField>
                              </Fieldset>
                              <Fieldset legend="Co-op / Multiplayer">
                                <CheckboxField name="players">
                                  {(fieldProps) => (
                                    <Checkbox
                                      {...fieldProps}
                                      label="Single"
                                      value="single"
                                      size="large"
                                      name="players"
                                      onChange={handleCheckboxChange}
                                    />
                                  )}
                                </CheckboxField>
                                <CheckboxField name="players">
                                  {(fieldProps) => (
                                    <Checkbox
                                      {...fieldProps}
                                      label="Local"
                                      value="local"
                                      size="large"
                                      name="players"
                                      onChange={handleCheckboxChange}
                                    />
                                  )}
                                </CheckboxField>
                                <CheckboxField name="players">
                                  {(fieldProps) => (
                                    <Checkbox
                                      {...fieldProps}
                                      label="Online"
                                      value="online"
                                      size="large"
                                      name="players"
                                      onChange={handleCheckboxChange}
                                    />
                                  )}
                                </CheckboxField>
                              </Fieldset>
                              <Button
                                shouldFitContainer
                                appearance="subtle"
                                onClick={handleClear}
                              >
                                Clear
                              </Button>
                            </FindFilters>
                          </Section>
                        </>
                      )}
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
