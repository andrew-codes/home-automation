import { FC, useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import Button from "./Button"
import TextField from "./TextField"
import { Checkbox } from "@atlaskit/checkbox"
import { Fieldset } from "@atlaskit/form"
import { Section } from "@atlaskit/side-navigation"
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react"
import Text from "./Text"

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
  value: string,
  values: string | string[],
  selected: boolean,
): string[] => {
  if (Array.isArray(values)) {
    const newValues = values.filter((v) => v !== value)
    if (selected && !!value) {
      newValues.push(value)
    }
    return newValues
  }

  return [value]
}

const Filters: FC<{ platforms: { id: string; name: string }[] }> = ({
  platforms,
}) => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [selectedPlatforms, setSelectedPlatforms] = useState(
    params.getAll("platform"),
  )
  const [selectedCollections, setSelectedCollections] = useState(
    params.getAll("collection"),
  )
  useEffect(() => {
    params.delete("platform")
    selectedPlatforms.forEach((platform) => params.append("platform", platform))

    params.set("collection", selectedCollections?.[0] ?? "all")

    navigate(`/games?${params.toString()}`)
  }, [selectedPlatforms, selectedCollections])

  const handleClear = useCallback(() => {
    setSelectedCollections(["all"])
  }, [])
  const handleCheckboxChange = useCallback(
    (evt) => {
      if (evt.target.checked) {
        setSelectedPlatforms(selectedPlatforms.concat([evt.target.value]))
      } else {
        setSelectedPlatforms(
          selectedPlatforms.filter((platform) => platform !== evt.target.value),
        )
      }
    },
    [selectedPlatforms],
  )

  const handleCollectionChange = useCallback((evt) => {
    setSelectedCollections([evt.currentTarget.name])
  }, [])

  return (
    <>
      <Section>
        <ChipButtonGroup>
          <ChipButton name="recent" onClick={handleCollectionChange}>
            <Text as="span">recent</Text>
          </ChipButton>
          <ChipButton name="all" onClick={handleCollectionChange}>
            <Text as="span">all</Text>
          </ChipButton>
        </ChipButtonGroup>
      </Section>
      <Section>
        <FindFilters>
          <Fieldset legend="Search">
            <TextField placeholder="by title" />
          </Fieldset>
          <Fieldset legend="Platform">
            {platforms.map((platform) => (
              <Checkbox
                key={platform.id}
                label={platform.name}
                value={platform.id}
                isChecked={!!selectedPlatforms.includes(platform.id)}
                size="large"
                name="platform"
                onChange={handleCheckboxChange}
              />
            ))}
          </Fieldset>
          <Fieldset legend="Co-op / Multiplayer">
            <Checkbox
              label="Single"
              value="single"
              size="large"
              name="players"
              onChange={handleCheckboxChange}
              isChecked={!!params.getAll("players")?.includes("single")}
            />
            <Checkbox
              label="Local"
              value="local"
              size="large"
              name="players"
              onChange={handleCheckboxChange}
              isChecked={!!params.getAll("players")?.includes("local")}
            />
            <Checkbox
              label="Online"
              value="online"
              size="large"
              name="players"
              onChange={handleCheckboxChange}
              isChecked={!!params.getAll("players")?.includes("online")}
            />
          </Fieldset>
          <Button shouldFitContainer appearance="subtle" onClick={handleClear}>
            <Text as="span">Clear</Text>
          </Button>
        </FindFilters>
      </Section>
    </>
  )
}

export default Filters
