import { FC, SyntheticEvent, useCallback } from "react"
import styled from "styled-components"
import Text from "./Text"

const Root = styled.section`
  text-align: center;
  margin: 0 8px;
  display: flex;
  > button {
    margin: 16px;
  }
`

const ButtonText = styled(Text)`
  font-size: 24px;
`

const Button = styled.button`
  flex: 1;
  padding: 24px;
  background: #238636;
  color: white;
  border: 4px solid rgba(240, 246, 252, 0.1);
  outline: none;
  opacity: 1;
  border-radius: 16px;

  &:disabled {
    background: gray;
  }
`

const GameActions: FC<{
  enabled?: boolean
  id: string
  releases: { id: string; platform: { name: string } }[]
  onStart?: (evt: SyntheticEvent, releaseId: string) => void
}> = ({ enabled, releases, onStart }) => {
  return (
    <Root>
      {releases?.map(({ id, platform: { name } }) => (
        <Button
          type="button"
          disabled={!enabled}
          onClick={(evt) => {
            onStart?.(evt, id)
          }}
        >
          <ButtonText as="span">{name.replace(/4$/, "")}</ButtonText>
        </Button>
      ))}
    </Root>
  )
}

export default GameActions
