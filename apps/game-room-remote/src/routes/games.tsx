import { Main } from "@atlaskit/page-layout"
import { LoaderFunction, json } from "@remix-run/node"
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react"
import type { GraphQLError } from "graphql"
import { sendGraphQLRequest } from "remix-graphql/index.server"
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer"
import { WindowScroller } from "react-virtualized/dist/commonjs/WindowScroller"
import { isEmpty, merge } from "lodash"
import { flow, filter, map, identity } from "lodash/fp"
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

type GamesQueryData = {
  data?: {
    games: {
      id: string
      name: string
      coverImage: string
    }[]
  }
  errors?: GraphQLError[]
}
type PlatformQueryData = {
  data?: {
    platforms: {
      id: string
      name: string
    }
  }
}
const gamesQuery = /* GraphQL */ `
  query Games {
    platforms {
      id
      name
    }
    games {
      id
      name
      coverImage
    }
  }
`

const platformsQuery = /* GraphQL */ `
  query Platforms {
    platforms {
      id
      name
    }
  }
`

export const loader: LoaderFunction = async (args) => {
  const gqlRequest = await Promise.all([
    sendGraphQLRequest({
      // Pass on the arguments that Remix passes to a loader function.
      args,
      // Provide the endpoint of the remote GraphQL API.
      endpoint: `${process.env.GRAPH_HOST}/graphql`,
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
    }).then((res) => res.json()) as GamesQueryData,
    sendGraphQLRequest({
      // Pass on the arguments that Remix passes to a loader function.
      args,
      // Provide the endpoint of the remote GraphQL API.
      endpoint: `${process.env.GRAPH_HOST}/graphql`,
      // Optionally add headers to the request.
      // Provide the GraphQL operation to send to the remote API.
      query: platformsQuery,
      // Optionally provide variables that should be used for executing the
      // operation. If this is not passed, `remix-graphql` will derive variables
      // from...
      // - ...the route params.
      // - ...the submitted `formData` (if it exists).
      // That means the following is the default and could also be ommited.
      // variables: args.params,
    }).then((res) => res.json()) as PlatformQueryData,
  ])

  const mapGames = flow(
    // platformFilter(removeNulls(platforms)),
    map((game) =>
      merge({}, game, {
        coverImage: `http://${process.env.GAMING_ASSETS_WEB_HOST}/${game.id}/${
          game.coverImage?.split("\\")?.[1]
        }`,
      }),
    ),
  )

  return json({
    data: {
      games: mapGames(gqlRequest[0].data?.games ?? []),
      platforms: gqlRequest[1].data?.platforms ?? [],
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
const Card = styled.div`
  width: 100%;
  height: ${({ height }) => `${height}px`};
  position: relative;
  background: url("${({ backgroundImage }) => backgroundImage}");
  background-size: ${({ width }) => `${width}px`}
    ${({ height }) => `${height}px`};
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

const sortByName = (a, b) => (a.name < b.name ? -1 : a.name === b.name ? 0 : 1)

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
        defaultHeight: cardHeight,
        defaultWidth: 300,
        fixedWidth: true,
      }),
    [cardHeight],
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

  const [params] = useSearchParams()
  const getParameter = (paramName) =>
    flow((params) => params.getAll(paramName), filter(identity))
  const [platforms, setPlatforms] = useState<string[]>(
    getParameter("platform")(params),
  )
  const [collections, setCollections] = useState(
    getParameter("collection")(params),
  )
  useEffect(() => {
    setPlatforms(getParameter("platform")(params))
    setCollections(getParameter("collection")(params))
  }, [params])

  const [sort, setSort] = useState(0)
  const { data } = useLoaderData<typeof loader>()
  const [games, setGames] = useState([])
  useEffect(() => {
    const collectionFilter = filter((game) => {
      const last2Weeks = new Date()
      last2Weeks.setDate(new Date().getDate() - 14)

      return (
        isEmpty(collections) ||
        collections.includes("all") ||
        (collections.includes("recent") &&
          Date.parse(game.recentActivity) >= last2Weeks.valueOf())
      )
    })
    const platformFilter = filter((game) => {
      return (
        isEmpty(platforms) ||
        game.platforms.some(({ id }) => {
          if (game.name === "Elden Ring") {
            console.log("elden ring", id, game.name, game.platforms)
          }
          return platforms.includes(id)
        })
      )
    })
    const filterGames = flow(collectionFilter)

    const filteredGames = filterGames(data?.games ?? [])
    setGames(
      sort % 2 === 0
        ? filteredGames.sort(sortByName)
        : filteredGames.sort().reverse(),
    )
  }, [sort, data?.games, platforms, collections])

  const renderGame = useCallback(
    ({ index, parent, key, style }) => {
      return isEmpty(games) || isEmpty(games[index]) ? null : (
        <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
          <div
            style={{
              ...style,
              columnWidth,
            }}
          >
            <Card
              height={cardHeight}
              backgroundImage={games[index].coverImage}
              width={columnWidth}
            >
              <Text as={CardTitle}>{games[index].name}</Text>
            </Card>
          </div>
        </CellMeasurer>
      )
    },
    [games, cache],
  )

  useEffect(() => {
    cellPositioner.reset({ columnCount, columnWidth, spacer: gutterSize })
    masonryRef.current.recomputeCellPositions()
  }, [games, columnWidth, columnCount, gutterSize])

  console.log("platfoorms", data)

  return (
    <>
      <Layout>
        <Navigation>
          <Section>
            <NavigationLink href="/">home</NavigationLink>
            <NavigationLink href="/games">browse</NavigationLink>
          </Section>
          <Section>
            <Filters platforms={data?.platforms ?? []} />
          </Section>
        </Navigation>
        <Main>
          <CenterPane>
            <Outlet />
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
