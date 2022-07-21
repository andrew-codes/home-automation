import * as React from "react"
import styled from "styled-components"
import Button from "./Button"
import TextField from "./TextField"
import { Checkbox } from "@atlaskit/checkbox"
import { CheckboxField, Field, Fieldset } from "@atlaskit/form"
import { Section } from "@atlaskit/side-navigation"
import { useRouter } from "next/router"

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

const ChipButtonGroup = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  > * {
    margin: 0 16px;
  }
`

const ChipButton = styled(Button)`
  border-radius: 18px !important;
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

const Filters = () => {
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
      <Section>
        <ChipButtonGroup>
          <ChipButton name="recent" onClick={handleCollectionChange}>
            recent
          </ChipButton>
          <ChipButton name="all" onClick={handleCollectionChange}>
            all
          </ChipButton>
        </ChipButtonGroup>
      </Section>
      <Section>
        <FindFilters>
          <Fieldset legend="Search">
            <Field name="search">
              {({ fieldProps }: any) => (
                <TextField placeholder="by title" {...fieldProps} />
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
                  isChecked={!!router.query.platform?.includes("tv")}
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
                  isChecked={!!router.query.platform?.includes("pc")}
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
                  isChecked={!!router.query.platform?.includes("playstation")}
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
                  isChecked={!!router.query.players?.includes("single")}
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
                  isChecked={!!router.query.players?.includes("local")}
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
                  isChecked={!!router.query.players?.includes("online")}
                />
              )}
            </CheckboxField>
          </Fieldset>
          <Button shouldFitContainer appearance="subtle" onClick={handleClear}>
            Clear
          </Button>
        </FindFilters>
      </Section>
    </>
  )
}

export default Filters
