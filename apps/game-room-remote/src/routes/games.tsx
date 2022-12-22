import { Main } from "@atlaskit/page-layout"
import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { GraphQLError } from "graphql"
import { sendGraphQLRequest } from "remix-graphql/index.server"
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer"
import { WindowScroller } from "react-virtualized/dist/commonjs/WindowScroller"
import { merge } from "lodash"
import {
  createCellPositioner,
  Masonry,
} from "react-virtualized/dist/commonjs/Masonry"
import {
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized/dist/commonjs/CellMeasurer"
import Filters from "../components/Filters"
import Layout from "../components/Layout"
import Navigation, { Section } from "../components/Navigation"
import NavigationLink from "../components/NavigationLink"
import Text from "../components/Text"
import styled from "styled-components"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type LoaderData = {
  data?: {
    games: {
      id: string
      name: string
      coverImage: string
      releaseYear: number
    }[]
  }
  errors?: GraphQLError[]
}

const gamesQuery = /* GraphQL */ `
  query Games {
    games {
      id
      name
      coverImage
      releaseYear
    }
  }
`

export const loader: LoaderFunction = async (args) => {
  const loadGamesReq = (await sendGraphQLRequest({
    // Pass on the arguments that Remix passes to a loader function.
    args,
    // Provide the endpoint of the remote GraphQL API.
    endpoint: process.env.GRAPHQL_HOST ?? "http://graph/graphql",
    // Optionally add headers to the request.
    // Provide the GraphQL operation to send to the remote API.
    query: gamesQuery,
    // Optionally provide variables that should be used for executing the
    // operation. If this is not passed, `remix-graphql` will derive variables
    // from...
    // - ...the route params.
    // - ...the submitted `formData` (if it exists).
    // That means the following is the default and could also be ommited.
    // variables: args.params,
  }).then((res) => res.json())) as LoaderData

  return json({
    data: {
      games: loadGamesReq.data?.games.map((game) =>
        merge({}, game, {
          coverImage: `${process.env.GAMING_ASSETS_WEB_HOST}/${game.id}/${
            game.coverImage?.split("\\")?.[1] ?? "NULL"
          }`,
        }),
      ),
    },
  })
}

const CenterPane = styled.div`
  height: 100vh;
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-left: 0 16px;
`

const CardTitle = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
`

function Games() {
  const masonryRef = useRef()
  const columnWidth = 300
  const gutterSize = 24
  const overscanRows = 12
  const cardHeight = (columnWidth * 4) / 3
  const overscanByPixels = (cardHeight + gutterSize) * overscanRows
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 250,
        defaultWidth: 300,
        fixedWidth: true,
      }),
    [],
  )
  const [columnCount, setColumnCount] = useState(0)
  const cellPositioner = useMemo(
    () =>
      createCellPositioner({
        cellMeasurerCache: cache,
        columnCount,
        columnWidth,
        spacer: gutterSize,
      }),
    [cache, columnCount, columnWidth, gutterSize],
  )
  const handleResize = useCallback(
    ({ width }) => {
      setColumnCount(Math.floor(width / (columnWidth + gutterSize)))
    },
    [columnWidth, gutterSize, cellPositioner],
  )

  const { data } = useLoaderData<LoaderData>()
  const [sort, setSort] = useState(0)
  const games = useMemo(
    () => (sort % 2 === 0 ? data?.games : data?.games.reverse()) ?? [],
    [sort, data?.games],
  )
  const renderGame = useCallback(({ index, parent, key, style }) => {
    return (
      <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
        <div
          style={{
            ...style,
            columnWidth,
            height: `${cardHeight}px`,
            position: "relative",
          }}
        >
          <CardTitle>games[index].name</CardTitle>
          <img
            src={games[index].coverImage}
            width={columnWidth}
            height={cardHeight}
          />
           
        </div>
      </CellMeasurer>
    )
  }, [])

  useEffect(() => {
    cellPositioner.reset({ columnCount, columnWidth, spacer: gutterSize })
    masonryRef.current.recomputeCellPositions()
  }, [sort, columnCount])

  return (
    <>
      <Layout>
        <Navigation>
          <Section>
            <NavigationLink href="/">home</NavigationLink>
            <NavigationLink href="/games">browse</NavigationLink>
          </Section>
          <Section>
            <Filters />
          </Section>
        </Navigation>
        <Main>
          <CenterPane>
            <Text as="h1">Browse</Text>
            <button onClick={() => setSort(sort + 1)}>Invert</button>
            <div style={{ flex: "1 1 auto" }}>
              <WindowScroller overscanByPixels={overscanByPixels}>
                {({ height, scrollTop }) => (
                  <AutoSizer
                    height={height}
                    scrollTop={scrollTop}
                    onResize={handleResize}
                    overscanByPixels={overscanByPixels}
                  >
                    {({ height, width }) => (
                      <Masonry
                        autoHeight={true}
                        ref={masonryRef}
                        cellCount={games.length}
                        cellMeasurerCache={cache}
                        cellPositioner={cellPositioner}
                        cellRenderer={renderGame}
                        height={height}
                        overscanByPixels={overscanByPixels}
                        scrollTop={scrollTop}
                        width={width}
                      />
                    )}
                  </AutoSizer>
                )}
              </WindowScroller>
            </div>
          </CenterPane>
        </Main>
      </Layout>
    </>
  )
}

export default Games
