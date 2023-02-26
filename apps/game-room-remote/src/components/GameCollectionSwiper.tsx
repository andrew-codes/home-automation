import { FC, SyntheticEvent, useCallback } from "react"
import { EffectCreative, Keyboard, Mousewheel } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import styled from "styled-components"
import type { Swiper as SwiperImpl } from "swiper"
import Text from "./Text"
import { Game } from "../Game"
import type { GameCollection } from "../GameCollection"

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

const CollectionName = styled.h2`
  height: 24px;
  margin: ${({ margin }) => margin};
`

const GameCover = styled.img`
  box-shadow: ${({ active }) =>
    active ? "0 0 48px 8px white, 0 0 24px 24px #007BA7" : "none"};
  border: ${({ active }) =>
    active ? "8px solid #1dacd6" : "8px solid transparent;"};
`

const BlankGameCover = styled.div`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`

const GameCollectionGame: FC<{
  id: string
  active?: boolean
  cdnHost: string
  name: string
  coverImage: string
  coverWidth: number
  coverHeight: number
  onSelect?: (evt: SyntheticEvent, id: string) => void
}> = ({
  active,
  id,
  cdnHost,
  name,
  coverImage,
  coverWidth,
  coverHeight,
  onSelect,
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
      data-component="GameCover"
      alt={`Cover art for ${name}`}
      src={`${cdnHost}/resize/${coverImage}?width=${coverWidth}&height=${coverHeight}`}
      width={coverWidth}
      height={coverHeight}
      onClick={handleSelect}
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
    height: number
    onPageChange?: PageChangeEventEventHandler
    onSelect?: GameChangeEventHandler
    slidesPerView: number
    spaceBetween: number
  } & Omit<GameCollection, "games">
> = ({
  id,
  cdnHost,
  initialSelectedGameId,
  games = [],
  name,
  onSelect,
  onPageChange,
  height,
  countPerPage,
  currentPageIndex,
  coverImageHeight,
  coverImageWidth,
  spaceBetween,
  slidesPerView,
}) => {
  const marginBottom = 48

  const currentGame =
    games.find(({ id }) => initialSelectedGameId === id) ?? games[0] ?? null

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
      <Text as={CollectionName} margin={`0 0 ${marginBottom}px 0`}>
        {name}
      </Text>
      <Swiper
        id={id}
        style={{ height: `${height}px` }}
        initialSlide={currentPageIndex * countPerPage}
        grabCursor
        keyboard
        mousewheel
        onSlideChange={handlePageChange}
        spaceBetween={spaceBetween}
        slidesPerGroup={countPerPage}
        slidesPerView={slidesPerView}
        creativeEffect={{
          prev: {
            translate: ["-20%", 0, -1],
          },
        }}
        modules={[Mousewheel, Keyboard, EffectCreative]}
      >
        {games.map((game) => (
          <SwiperSlide key={game.id}>
            <GameCollectionGame
              id={game.id}
              active={currentGame.id === game.id}
              cdnHost={cdnHost}
              name={game.name}
              coverImage={game.coverImage}
              coverHeight={coverImageHeight}
              coverWidth={coverImageWidth}
              onSelect={handleSelect}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default GameCollectionSwiper
export type { GameChangeEventHandler, PageChangeEventEventHandler }
