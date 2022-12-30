import { useFetcher } from "@remix-run/react"
import { first, isEmpty, noop } from "lodash"
import {
  FC,
  memo,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react"
import { EffectCreative, Keyboard, Mousewheel } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import { GameListGame } from "../collections.server"
import PrepareImage from "./PreloadImage"

const GameList: FC<{
  collectionName: string
  cdnHost: string
  height: number
  width: number
  defaultSelection?: boolean
  onSelect?: (evt: SyntheticEvent, game: GameListGame) => void
}> = ({
  cdnHost,
  collectionName,
  defaultSelection,
  onSelect = noop,
  height,
  width,
}) => {
  const slidesPerView = 7
  const spaceBetween = 64
  const slideWidth = Math.floor(width / slidesPerView - spaceBetween)
  const slideHeight = Math.floor((slideWidth * 4) / 3)
  const slidesPerGroup = 5

  const [currentPage, setCurrentPage] = useState(1)
  const fetcher = useFetcher<{ games: GameListGame[] }>()
  useEffect(() => {
    fetcher.submit(
      { collectionName, currentPage: currentPage.toString() },
      {
        method: "post",
        action: "games/list/next",
      },
    )
  }, [currentPage, collectionName])
  const games = fetcher.data?.games ?? []

  const handleSelect = useCallback(
    (game: GameListGame) => (evt: SyntheticEvent<HTMLImageElement>) => {
      onSelect(evt, game)
    },
    [onSelect],
  )

  const [initialSelectionMade, setInitialSelectionMade] = useState(false)
  useEffect(() => {
    if (!defaultSelection || (initialSelectionMade && isEmpty(games))) {
      return
    }
    onSelect(null, first(games))
    setInitialSelectionMade(true)
  }, [initialSelectionMade, games])

  return (
    <>
      <fetcher.Form />
      {games.map(({ id, coverImage }) => (
        <PrepareImage
          key={id}
          rel="preload"
          src={`${cdnHost}/resize/${coverImage}?width=${slideWidth}&height=${slideHeight}`}
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
        {games.map((game) => (
          <SwiperSlide key={game.id}>
            <img
              alt={`Cover art for ${game.name}`}
              src={`${cdnHost}/resize/${game.coverImage}?width=${slideWidth}&height=${slideHeight}`}
              width={slideWidth}
              height={slideHeight}
              onClick={handleSelect(game)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default GameList
