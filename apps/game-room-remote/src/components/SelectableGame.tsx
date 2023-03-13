import { FC, SyntheticEvent, useCallback, useEffect, useState } from "react"
import styled from "styled-components"

const Button = styled.button`
  background: transparent;
  border: none;
  outline: none;
`
const GameCoverImage = styled.img`
  border-radius: 24px;
  width: 100%;
  height: 100%;
  border: 1px solid
    ${({ active }) => (active ? "var(--dark-gray)" : "transparent")};
  box-shadow: 4px 8px 24px 8px rgba(39, 40, 48, 0.75);
`

const GameCoverRoot = styled.div`
  background: var(--dark-gray);
  display: inline-block;
  border-radius: 24px;
  height: ${({ coverHeight }) => coverHeight}px;
  width: ${({ coverWidth }) => coverWidth}px;
  z-index: 10;

  ${({ active, animate, deselected, scaleFactor }) => {
    const timing = 0.6

    if (!animate) return ""
    if (!!active) {
      return `
  animation: selectGame ${timing}s;
  transform: scale(${scaleFactor});
`
    }
    if (deselected) {
      return `
      animation: deselectGame ${timing * 0.25}s;
    `
    }
  }}
`

const BlankGameCover = styled.div`
  display: inline-block;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`

const GameCover = ({
  active,
  animate,
  deselected,
  name,
  coverImage,
  coverWidth,
  coverHeight,
  scaleFactor,
}) => {
  return (
    <GameCoverRoot
      active={active}
      animate={animate}
      deselected={deselected}
      scaleFactor={scaleFactor}
      coverHeight={coverHeight}
      coverWidth={coverWidth}
    >
      <GameCoverImage
        active={active}
        data-component="GameCover"
        alt={`Cover art for ${name}`}
        src={`${coverImage}?height=${coverHeight}&width=${coverWidth}`}
      />
    </GameCoverRoot>
  )
}

const SelecteableGame: FC<{
  active: boolean
  id: string
  name: string
  coverImage?: string | undefined | null
  height: number
  width: number
  onSelect?: (evt: SyntheticEvent, id: string) => void
}> = ({ active, id, name, width, height, coverImage, onSelect }) => {
  const handleSelect = useCallback(
    (evt) => {
      onSelect?.call(null, evt, id)
    },
    [id, onSelect],
  )

  const [shouldAnimate, setShouldAnimate] = useState(false)
  useEffect(() => {
    setShouldAnimate(true)
  }, [])

  const [previousActive, setPreviousActive] = useState(active)
  useEffect(() => {
    setPreviousActive(active)
  }, [active])

  const selectedCoverScaleFactor = 1.2

  return (
    <Button onClick={handleSelect}>
      {!!coverImage && !/null$/.test(coverImage) ? (
        <GameCover
          active={active}
          deselected={!!previousActive && !active}
          animate={shouldAnimate}
          coverImage={coverImage}
          coverWidth={width}
          coverHeight={height}
          data-component="GameCover"
          name={`Cover art for ${name}`}
          scaleFactor={selectedCoverScaleFactor}
        />
      ) : (
        <BlankGameCover height={height} width={width} />
      )}
    </Button>
  )
}

export default SelecteableGame
