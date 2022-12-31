import { useFetcher } from "@remix-run/react"
import { isEmpty, noop } from "lodash"
import { FC, SyntheticEvent, useCallback, useEffect, useState } from "react"
import { EffectCreative, Keyboard, Mousewheel } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import styled from "styled-components"
import PrepareImage from "./PreloadImage"
import Text from "./Text"
import { Game } from "../Game"
import type { GameCollection } from "../GameCollection"

type CollectionGameSelection = {
  collectionName: string
  game: Game
}

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

const GameCollectionGame: FC<{
  active?: boolean
  cdnHost: string
  name: string
  coverImage: string
  coverWidth: number
  coverHeight: number
  onSelect: (evt: SyntheticEvent) => void
}> = ({
  active,
  cdnHost,
  name,
  coverImage,
  coverWidth,
  coverHeight,
  onSelect,
}) => {
  return (
    <GameCover
      active={active}
      data-component="GameCover"
      alt={`Cover art for ${name}`}
      src={`${cdnHost}/resize/${coverImage}?width=${coverWidth}&height=${coverHeight}`}
      width={coverWidth}
      height={coverHeight}
      onClick={onSelect}
    />
  )
}

const GameCollectionSwiper: FC<
  {
    cdnHost: string
    height: number
    width: number
    defaultSelection?: boolean
    onSelect?: (
      evt: SyntheticEvent,
      selectedCollectionGame: CollectionGameSelection,
    ) => void
  } & GameCollection
> = ({
  cdnHost,
  name,
  defaultSelection,
  games = [],
  onSelect = noop,
  height,
  width,
}) => {
  const marginBottom = 48
  const slidesPerView = 7
  const spaceBetween = 64
  const slideWidth = Math.floor(width / slidesPerView - spaceBetween)
  const slideHeight = height - 24 - 24 - marginBottom
  const slidesPerGroup = 5

  const [currentPage, setCurrentPage] = useState(1)
  const fetcher = useFetcher<{ games: Game[] }>()
  useEffect(() => {
    fetcher.submit(
      { collectionName: name, currentPage: currentPage.toString() },
      {
        method: "post",
        action: "games/list/next",
      },
    )
  }, [currentPage, name])

  const _games = fetcher.data?.games ?? games

  const [initialSelectionMade, setInitialSelectionMade] = useState(false)
  const [selectedGame, setSelectedGame] = useState(games[0] ?? null)
  const handleSelect = useCallback(
    (game: Game) => (evt: SyntheticEvent | null) => {
      setSelectedGame(game)
      onSelect(evt, { collectionName: name, game })
    },
    [onSelect, name],
  )

  useEffect(() => {
    if (!defaultSelection || initialSelectionMade || isEmpty(_games)) {
      return
    }
    const game = _games[0]
    handleSelect(game)(null)
    setInitialSelectionMade(true)
  }, [_games, initialSelectionMade, defaultSelection])

  return (
    <>
      <fetcher.Form />
      <Text as={CollectionName} margin={`0 0 ${marginBottom}px 0`}>
        {name}
      </Text>
      {_games.map(({ id, coverImage }) => (
        <PrepareImage
          key={id}
          rel="preload"
          src={`${cdnHost}/resize/${coverImage}?width=1400`}
        />
      ))}
      {_games.map(({ id, backgroundImage }) => (
        <PrepareImage
          key={id}
          rel="preload"
          src={`${cdnHost}/resize/${backgroundImage}?width=${slideWidth}&height=${slideHeight}`}
        />
      ))}
      <Swiper
        style={{ height: `${height}px` }}
        grabCursor
        keyboard
        mousewheel
        onSlideChange={(swiper) => {
          if (swiper.activeIndex + 1 > currentPage * slidesPerGroup) {
            setCurrentPage(currentPage + 1)
          }
        }}
        spaceBetween={spaceBetween}
        slidesPerGroup={slidesPerGroup}
        slidesPerView={slidesPerView}
        creativeEffect={{
          prev: {
            translate: ["-20%", 0, -1],
          },
        }}
        modules={[Mousewheel, Keyboard, EffectCreative]}
      >
        {_games.map((game) => (
          <SwiperSlide key={game.id}>
            <GameCollectionGame
              active={selectedGame?.id === game.id}
              cdnHost={cdnHost}
              name={game.name}
              coverImage={game.coverImage}
              coverHeight={slideHeight}
              coverWidth={slideWidth}
              onSelect={handleSelect(game)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default GameCollectionSwiper
export type { CollectionGameSelection }
