import { Main } from "@atlaskit/page-layout"
import { LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { GraphQLError } from "graphql"
import { sendGraphQLRequest } from "remix-graphql/index.server"
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer"
import { WindowScroller } from "react-virtualized/dist/commonjs/WindowScroller"
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
    games: { id: string; name: string; coverImage: string | null }[]
    releaseYear: number
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

export const loader: LoaderFunction = (args) =>
  sendGraphQLRequest({
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
  })

const CenterPane = styled.div`
  height: 100vh;
  display: flex;
  width: 100%;
  flex-direction: column;
`

function Games() {
  const masonryRef = useRef()
  const columnWidth = 300
  const gutterSize = 24
  const overscanByPixels = ((columnWidth * 4) / 3) * 6
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
        <div style={{ ...style, columnWidth }}>
          {games[index].name}
          <img
            src={`http://gaming-assets-web/${games[index].id}/${
              games[index].coverImage?.split("\\")[1]
            }`}
            width={columnWidth}
            height={(columnWidth * 4) / 3}
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
            {data?.games.map((game) => (
              <link
                key={game.id}
                rel="prefetch"
                href={`http://gaming-assets-web/${game.id}/${
                  game.coverImage?.split("\\")[1]
                }`}
              />
            ))}
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
