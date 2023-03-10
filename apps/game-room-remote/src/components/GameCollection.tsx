import { ceil } from "lodash"
import { FC, SyntheticEvent, useContext, useMemo } from "react"
import styled, { createGlobalStyle } from "styled-components"
import { EffectCreative, Keyboard, Mousewheel } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import GameCollectionGame from "./GameCollectionGame"
import { GameCollectionsContext } from "./GameCollections"
import Text from "./Text"

const GlobalStyle = createGlobalStyle`
@keyframes selectGame {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.2);
  }
}
@keyframes deselectGame {
  from {
    transform: scale(1.20);
  }
  to {
    transform: scale(1);
  }
}
`

const Root = styled.div`
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

type GameCollectionProps = {
  onSelectGame?: (evt: SyntheticEvent, gameId: string) => void
}
const GameCollection: FC<GameCollectionProps> = ({ onSelectGame }) => {
  const marginBottom = 48
  const ctx = useContext(GameCollectionsContext)

  const totalPages = useMemo(
    () =>
      ceil(ctx.currentCollection?.games.length ?? 0 / (ctx?.countPerPage ?? 1)),
    [ctx.currentCollection?.games.length, ctx.countPerPage],
  )
  const pages = useMemo(
    () =>
      new Array(totalPages)
        .fill(0)
        .map(
          (_, index) =>
            ctx.currentCollection?.games.slice(
              index * (ctx?.countPerPage ?? 1),
              index * (ctx?.countPerPage ?? 1) + (ctx?.countPerPage ?? 1),
            ) ?? [],
        ),
    [totalPages, ctx.currentCollection?.games, ctx?.countPerPage],
  )

  return (
    <>
      <GlobalStyle />
      <Root>
        <Text as={CollectionName} margin={marginBottom}>
          {ctx.currentCollection?.name}
        </Text>
        <Swiper
          style={{ width: `${ctx.width}px`, height: "100%", marginTop: "72px" }}
          initialSlide={0}
          grabCursor
          keyboard
          mousewheel
          direction="vertical"
          // onSlideChange={handlePageChange}
          modules={[Mousewheel, Keyboard, EffectCreative]}
        >
          {pages.map((games, index) => (
            <SwiperSlide key={index}>
              <GameList>
                {games.map((game) => (
                  <GameCollectionGame {...game} onSelect={onSelectGame} />
                ))}
              </GameList>
            </SwiperSlide>
          ))}
        </Swiper>
      </Root>
    </>
  )
}

export default GameCollection
