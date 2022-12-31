import { Main } from "@atlaskit/page-layout"
import AutoSizer from "react-virtualized-auto-sizer"
import { json, LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { useCallback, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import collectionDefinitions from "../api/collections.server"
import Layout from "../components/Layout"
import GameCollectionSwiper, {
  CollectionGameSelection,
} from "../components/GameCollectionSwiper"
import { Game } from "../Game"
import GameOverview from "../components/GameOverview"
import { GameCollection } from "../GameCollection"
import fetchGameCollections from "../api/fetchGameCollection.server"
import PrepareImage from "../components/PreloadImage"

export const loader = async (args: LoaderArgs) => {
  const collections = await fetchGameCollections(collectionDefinitions)

  return json<{ data: { cdnHost: string; collections: GameCollection[] } }>({
    data: {
      cdnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "",
      collections,
    },
  })
}

const CenterPane = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 0;
  height: 100vh;
  background-image: url("${({ backgroundImage }) => backgroundImage}");
  background-size: cover;
`
const GameCollections = styled.div`
  overflow: hidden;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: ${({ spaceBetween }) => spaceBetween}px;
    z-index: 2;
    background-color: var(--dark-slate-gray);
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      transparent 100%
    );
  }

  > div {
    padding: 48px 0 0 24px;
    display: flex;
    width: 100%;
    height: ${({ height }) => height}px;
    overflow: visible;
    position: relative;
    background: var(--dark-slate-gray);

    &:after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${({ spaceBetween }) => spaceBetween}px;
      z-index: 2;
      background-color: var(--dark-slate-gray);
      mask-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 1) 0%,
        transparent 100%
      );
    }

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
const BottomSpacer = styled.div`
  height: 18px;
  background: var(--dark-slate-gray);
`

export default function Games() {
  const {
    data: { cdnHost, collections },
  } = useLoaderData<typeof loader>()

  const [activeCollection, setActiveCollection] = useState(collections[0].name)
  const [currentGame, setCurrentGame] = useState<Game>(collections[0].games[0])
  const handleSelect = useCallback(
    (evt, collectionGameSelection: CollectionGameSelection) => {
      setCurrentGame(collectionGameSelection.game)
      setActiveCollection(collectionGameSelection.collectionName)
    },
    [],
  )

  const listHeight = 560
  const spaceBetweenLists = 24
  const listViewPortHeight = listHeight * 1.1 + 24 + 24

  return (
    <Layout>
      <Main>
        <PrepareImage
          rel="preload"
          src={`${cdnHost}/resize/${currentGame?.backgroundImage}?width=1400`}
        />
        <CenterPane
          backgroundImage={`${cdnHost}/resize/${currentGame?.backgroundImage}?width=1400`}
        >
          <Outlet />
          <GameOverview {...currentGame} cdnHost={cdnHost} />
          <GameCollections
            activeIndex={
              collections.findIndex(
                (collection) => collection.name === activeCollection,
              ) ?? 0
            }
            height={listViewPortHeight}
            spaceBetween={spaceBetweenLists}
          >
            <div>
              <AutoSizer disableHeight>
                {({ width }) => (
                  <Swiper
                    style={{
                      height: `${listHeight}px`,
                      width: `${width - 48}px`,
                    }}
                    grabCursor
                    keyboard
                    mousewheel
                    direction="vertical"
                    spaceBetween={spaceBetweenLists}
                    slidesPerView={1}
                    modules={[]}
                  >
                    {collections.map(({ name, games }, index) => (
                      <SwiperSlide
                        key={name}
                        data-selected={name === activeCollection}
                      >
                        <div
                          style={{
                            padding: "16px 24px 0 24px",
                            borderRadius: index % 2 === 1 ? "20px" : "20px",
                            backgroundColor:
                              index % 2 === 1
                                ? "rgba(255,255,255,0.10)"
                                : "rgba(13, 17, 23, 1)",
                          }}
                        >
                          <GameCollectionSwiper
                            games={games}
                            name={name}
                            cdnHost={cdnHost}
                            width={width}
                            height={listHeight}
                            onSelect={handleSelect}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </AutoSizer>
            </div>
          </GameCollections>
          <BottomSpacer />
        </CenterPane>
      </Main>
    </Layout>
  )
}
