import {
  FC,
  SyntheticEvent,
  createContext,
  useMemo,
  useReducer,
  ReactNode,
} from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import styled from "styled-components"
import { ceil } from "lodash"
import { Helmet } from "react-helmet"
import { Swiper, SwiperSlide } from "swiper/react"

const Root = styled.div`
  overflow: hidden;
  position: relative;
  flex-direction: column;
  z-index: 1;

  > div {
    padding: 0;
    display: flex;
    height: 100%;
    overflow: visible;
    position: relative;
    margin: 24px 0;

    .swiper-vertical {
      overflow: visible !important;
    }
  }

  .swiper-horizontal {
    overflow: visible;
  }

  [data-selected="false"] [data-component="GameCover"] {
    box-shadow: none !important;
    border: 8px solid transparent !important;
  }
`

type Game = {
  id: string
  name: string
  coverImage: string
}

type GameCollection = {
  id: string
  name: string
  games: Game[]
}

type State = {
  currentCollectionIndex: number
  currentGameId: string
}
type AnyAction = ReturnType<typeof selectCollection>
const selectCollection = (id: string) => ({
  type: "selectCollection",
  payload: id,
})

const reducer = (state: State, action: AnyAction): State => {
  return state
}

const GameCollectionsContext = createContext<{
  countPerPage?: number
  width?: number
  coverHeight?: number
  coverWidth?: number
  currentCollection?: GameCollection
  selectedCoverScaleFactor?: number
}>({})

type GameCollectionsProps = {
  children: ReactNode[] | ReactNode
  defaultCollectionIndex?: number
  collections: GameCollection[]
  rows: number
  spaceBetweenLists: number
  gamesPerRow: number
}

const GameCollections: FC<GameCollectionsProps> = ({
  children,
  collections = [],
  gamesPerRow = 1,
  rows = 1,
  spaceBetweenLists = 24,
  defaultCollectionIndex = 0,
}) => {
  const allCoverImageUrls = useMemo(() => {
    return collections
      .map((collection) => collection.games)
      .flat()
      .map((game) => game.coverImage)
      .filter((url) => !!url && !/null$/.test(url))
  }, [collections])

  const [state, setState] = useReducer(reducer, {
    currentCollectionIndex: defaultCollectionIndex,
    currentGameId: collections[defaultCollectionIndex]?.games[0].id,
  })

  const countPerPage = useMemo(() => gamesPerRow * rows, [gamesPerRow, rows])

  const selectedCoverScaleFactor = 1.2

  return (
    <Root>
      <div>
        <AutoSizer disableWidth>
          {({ height }) => {
            const coverHeight = ceil(height / rows) - spaceBetweenLists - 24
            const coverWidth = ceil((coverHeight * 3) / 4)
            const width =
              coverWidth * gamesPerRow + 48 + 24 * gamesPerRow + 48 + 48

            return (
              <>
                <Helmet>
                  {allCoverImageUrls.map((url, index) => (
                    <link
                      rel="prefetch"
                      as="image"
                      type="image/webp"
                      key={`${url}-cover-${index}}`}
                      href={`${url}?width=${ceil(
                        coverWidth * selectedCoverScaleFactor,
                      )}&height=${ceil(
                        coverHeight * selectedCoverScaleFactor,
                      )}`}
                    />
                  ))}
                </Helmet>
                <Swiper
                  style={{
                    height: `${height}px`,
                    width: `${width}px`,
                  }}
                  initialSlide={state.currentCollectionIndex}
                  grabCursor
                  keyboard
                  mousewheel
                  // onSlideChange={handleCollectionChange}
                  direction="horizontal"
                  slidesPerView={1}
                  modules={[]}
                >
                  {collections.map((collection, index) => (
                    <SwiperSlide
                      key={collection.id}
                      data-selected={index === state.currentCollectionIndex}
                      style={{}}
                    >
                      <GameCollectionsContext.Provider
                        value={{
                          countPerPage,
                          width,
                          coverHeight,
                          coverWidth,
                          currentCollection:
                            collections[state.currentCollectionIndex],
                          selectedCoverScaleFactor,
                        }}
                      >
                        {children}
                      </GameCollectionsContext.Provider>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </>
            )
          }}
        </AutoSizer>
      </div>
    </Root>
  )
}

export default GameCollections
export { GameCollectionsContext }
