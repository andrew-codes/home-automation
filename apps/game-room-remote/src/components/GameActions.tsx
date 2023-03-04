import { FC, SyntheticEvent, useCallback } from "react"
import styled from "styled-components"
import { Game } from "../Game"
import Text from "./Text"

const Root = styled.section`
  text-align: center;
`

const ButtonText = styled(Text)`
  font-size: 24px;
`

const Button = styled.button`
  width: 320px;
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

const GameActions: FC<
  Game & {
    systemState: string
    onStart: (evt: SyntheticEvent) => void
    onStop: (evt: SyntheticEvent) => void
  }
> = ({ id, onStart, onStop, systemState }) => {
  const handleClick = useCallback(
    (evt) => {
      if (systemState === "") {
        onStart(evt)
      } else if (systemState === id) {
        onStop(evt)
      }
    },
    [systemState, id],
  )

  return (
    <Root>
      <Button
        type="button"
        disabled={systemState !== "" && systemState !== id}
        onClick={handleClick}
      >
        <ButtonText as="span">
          {systemState === id ? "Stop" : "Play"}
        </ButtonText>
      </Button>
    </Root>
  )
}

export default GameActions
