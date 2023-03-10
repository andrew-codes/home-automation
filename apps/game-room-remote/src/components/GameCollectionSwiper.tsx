import { FC, SyntheticEvent, useCallback } from "react"
import { EffectCreative, Keyboard, Mousewheel } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import styled, { createGlobalStyle } from "styled-components"
import type { Swiper as SwiperImpl } from "swiper"
import Text from "./Text"
import type { Game } from "../Game"
import type { GameCollection } from "../GameCollection"
import { ceil } from "lodash"

type PageChangeEventArgs = {
  currentPageIndex: number
  previousPageIndex: number
}
type PageChangeEventEventHandler = (
  evt: SyntheticEvent | null,
  args: PageChangeEventArgs,
) => void
type GameChangeEventHandler = (
  evt: SyntheticEvent | null,
  eventArgs: { id: string },
) => void

const CollectionRoot = styled.div`
  padding: 24px;
  margin: 24px;
  width: 100%;
  height: 100%;
  overflow: visible;
`

const CollectionName = styled.h2`
  position: absolute;
  background: var(--dark-gray);
  border-radius: 16px;
  z-index: 5;
  margin: 0 24px 24px;
  top: 0;
  left: 0;
  padding: 16px;
  width: calc(100% - ${({ margin }) => margin * 2}px);
`

const GameList = styled.div`
  width: 100%;

  > div {
    margin: 12px;
  }
`

const GameCoverImage = styled.img`
  height: 100%;
  width: 100%;
  border-radius: 24px;
  border: 1px solid
    ${({ active }) => (active ? "var(--dark-gray)" : "transparent")};
  box-shadow: 4px 8px 24px 8px rgba(39, 40, 48, 0.75);
`

const BlankGameCover = styled.div`
  display: inline-block;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
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

const GameCover = ({
  active,
  name,
  cdnHost,
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
        src={`${cdnHost}/resize/${coverImage}?width=${ceil(
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
  active?: boolean
  cdnHost: string
  name: string
  coverImage: string
  coverWidth: number
  coverHeight: number
  onSelect?: (evt: SyntheticEvent, id: string) => void
  scaleFactor?: number
}> = ({
  active,
  id,
  cdnHost,
  name,
  coverImage,
  coverWidth,
  coverHeight,
  onSelect,
  scaleFactor,
}) => {
  const handleSelect = useCallback(
    (evt) => {
      onSelect?.call(null, evt, id)
    },
    [id],
  )

  return !!coverImage ? (
    <GameCover
      active={active}
      cdnHost={cdnHost}
      coverImage={coverImage}
      coverWidth={coverWidth}
      coverHeight={coverHeight}
      data-component="GameCover"
      name={`Cover art for ${name}`}
      onClick={handleSelect}
      scaleFactor={scaleFactor}
    />
  ) : (
    <BlankGameCover
      height={coverHeight}
      width={coverWidth}
      onClick={handleSelect}
    />
  )
}

const GameCollectionSwiper: FC<
  {
    coverImageHeight: number
    coverImageWidth: number
    games: Game[]
    initialSelectedGameId?: string
    cdnHost: string
    onPageChange?: PageChangeEventEventHandler
    onSelect?: GameChangeEventHandler
    slidesPerView: number
    spaceBetween: number
    total: number
    width: number
    scaleFactor?: number
  } & Omit<GameCollection, "games">
> = ({
  id,
  cdnHost,
  initialSelectedGameId,
  games = [],
  name,
  onSelect,
  onPageChange,
  countPerPage,
  currentPageIndex,
  coverImageHeight,
  coverImageWidth,
  scaleFactor,
  total,
  width,
}) => {
  const marginBottom = 48

  const currentGame =
    games.find(({ id }) => initialSelectedGameId === id) ?? games[0] ?? null

  const totalPages = ceil(total / countPerPage)
  const pages = new Array(totalPages)
    .fill(1)
    .map((_, index) =>
      games.slice(index * countPerPage, index * countPerPage + countPerPage),
    )

  const handleSelect = useCallback(
    (evt: SyntheticEvent | null, id: string) => {
      onSelect?.call(null, evt, { id })
    },
    [onSelect],
  )

  const handlePageChange = useCallback(
    (swiper: SwiperImpl) => {
      if (swiper.$el.attr("id") !== id) {
        return
      }

      const newPageIndex = Math.ceil(swiper.activeIndex / countPerPage)
      let previousPageIndex = currentPageIndex
      onPageChange?.call(null, null, {
        currentPageIndex: newPageIndex,
        previousPageIndex: previousPageIndex,
      })
    },
    [countPerPage, currentPageIndex, id],
  )

  return (
    <>
      <GlobalStyle />
      <CollectionRoot>
        <Text as={CollectionName} margin={marginBottom}>
          {name}
        </Text>
        <Swiper
          style={{ width: `${width}px`, height: "100%", marginTop: "72px" }}
          id={id}
          initialSlide={currentPageIndex}
          grabCursor
          keyboard
          mousewheel
          direction="vertical"
          onSlideChange={handlePageChange}
          modules={[Mousewheel, Keyboard, EffectCreative]}
        >
          {pages.map((games, index) => (
            <SwiperSlide key={index}>
              <GameList>
                {games.map((game) => (
                  <GameCollectionGame
                    id={game.id}
                    key={game.id}
                    active={currentGame.id === game.id}
                    cdnHost={cdnHost}
                    name={game.name}
                    coverImage={game.coverImage}
                    coverHeight={coverImageHeight}
                    coverWidth={coverImageWidth}
                    onSelect={handleSelect}
                    scaleFactor={scaleFactor}
                  />
                ))}
              </GameList>
            </SwiperSlide>
          ))}
        </Swiper>
      </CollectionRoot>
    </>
  )
}

export default GameCollectionSwiper
export type { GameChangeEventHandler, PageChangeEventEventHandler }
