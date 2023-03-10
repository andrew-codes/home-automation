import styled from "styled-components"
import { FC, SyntheticEvent, useCallback, useContext } from "react"
import { ceil } from "lodash"
import { GameCollectionsContext } from "./GameCollections"

const GameCoverImage = styled.img`
  height: 100%;
  width: 100%;
  border-radius: 24px;
  border: 1px solid
    ${({ active }) => (active ? "var(--dark-gray)" : "transparent")};
  box-shadow: 4px 8px 24px 8px rgba(39, 40, 48, 0.75);
`

const GameCoverRoot = styled.div`
  background: var(--dark-gray);
  border-radius: 24px;
  z-index: 10;
  ${({ active }) => {
    const timing = 0.6

    return !!active
      ? `
  animation: selectGame ${timing}s;
  transform: scale(1.2);
`
      : `
  animation: deselectGame ${timing * 0.25}s;
`
  }}
  display: inline-block;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`

const BlankGameCover = styled.div`
  display: inline-block;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`

const GameCover = ({
  active,
  name,
  coverImage,
  coverWidth,
  coverHeight,
  onClick,
  scaleFactor,
}) => {
  return (
    <GameCoverRoot width={coverWidth} height={coverHeight} active={active}>
      <GameCoverImage
        active={active}
        data-component="GameCover"
        alt={`Cover art for ${name}`}
        src={`${coverImage}?width=${ceil(
          coverWidth * scaleFactor,
        )}&height=${ceil(coverHeight * scaleFactor)}`}
        coverWidth={coverWidth}
        coverHeight={coverHeight}
        onClick={onClick}
      />
    </GameCoverRoot>
  )
}

const GameCollectionGame: FC<{
  id: string
  name: string
  coverImage: string
  onSelect?: (evt: SyntheticEvent, id: string) => void
}> = ({ id, name, coverImage, onSelect }) => {
  const ctx = useContext(GameCollectionsContext)

  const handleSelect = useCallback(
    (evt) => {
      onSelect?.call(null, evt, id)
    },
    [id],
  )

  return !!coverImage && !/null$/.test(coverImage) ? (
    <GameCover
      active={false}
      coverImage={coverImage}
      coverWidth={ctx.coverWidth}
      coverHeight={ctx.coverHeight}
      data-component="GameCover"
      name={`Cover art for ${name}`}
      onClick={handleSelect}
      scaleFactor={ctx.selectedCoverScaleFactor}
    />
  ) : (
    <BlankGameCover
      height={ctx.coverHeight}
      width={ctx.coverWidth}
      onClick={handleSelect}
    />
  )
}

export default GameCollectionGame
