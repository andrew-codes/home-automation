import * as React from "react"
import styled, { createGlobalStyle } from "styled-components"
import { useRouter } from "next/router"
import { Content, LeftSidebar, Main, PageLayout } from "@atlaskit/page-layout"
import {
  Header,
  NavigationContent,
  NavigationHeader,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation"
import Button from "@atlaskit/button"
import TextField from "@atlaskit/textfield"
import { CheckboxField, Field, Fieldset } from "@atlaskit/form"
import { Checkbox } from "@atlaskit/checkbox"
import Link from "next/link"

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
const Sidebar = styled.div`
  height: 100%;
`
const NavBorder = styled(Sidebar)`
  border-right: 1px solid rgb(88, 89, 86);
`
const DetailsPane = styled(Sidebar)`
  border-left: 1px solid rgb(88, 89, 86);
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

const Chips = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  > * {
    margin: 0 16px;
  }
`
const Chip = styled(Button)`
  background: var(--dark-gray);
  border-radius: 8px;
  border: 1px solid var(--off-white) !important;
  color: var(--off-white);
  text-decoration: none;
  text-align: center;
  min-width: 94px !important;
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
      <PageLayout>
        <Content>
          <NavBorder>
            <LeftSidebar width={350}>
              <SideNavigation label="Game Room Navigation">
                <NavigationHeader>
                  <Chips>
                    <Chip name="recent" onClick={handleCollectionChange}>
                      recent
                    </Chip>
                    <Chip name="all" onClick={handleCollectionChange}>
                      all
                    </Chip>
                  </Chips>
                </NavigationHeader>
                <NavLayout>
                  <NavigationContent>
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
