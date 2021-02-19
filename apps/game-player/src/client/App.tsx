import * as React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { AppBar, Box, Drawer, Tab, Tabs } from "@material-ui/core"
import { gql, useQuery } from "@apollo/client"
import { merge } from "lodash"
import { GameGrid } from "./GameGrid"
import { query as gameQuery } from "./GameSummary"

const GET_GAMES = gql`
  query {
    game(orderBy: { name: asc }) {
      playniteId
      releaseYear
      favorite
      hidden
      platform {
        name
      }
      state
      ...GameSummary
    }
  }
  ${gameQuery}
`
const GAME_STATE_UPDATES = gql`
  subscription {
    gameState {
      id
      playniteId
      state
    }
  }
`

const TabPanel = ({ children, index, value, ...rest }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`game-tabpanel-${index}`}
    aria-labelledby={`game-tab-${index}`}
    {...rest}
  >
    {value === index && <Box p={3}>{children}</Box>}
  </div>
)

const Loading = () => <div>Loading...</div>

const App = () => {
  const [open, setOpen] = React.useState(false)

  const [tabIndex, setTabIndex] = React.useState(0)
  const handleTabIndexChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  const { loading, data, error, subscribeToMore } = useQuery(GET_GAMES)
  React.useEffect(() => {
    subscribeToMore({
      document: GAME_STATE_UPDATES,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(prev, subscriptionData)
        if (!subscriptionData.data) {
          return merge({}, prev, {
            game: prev.game
              .filter(
                ({ state }) => state == "Launching" || state === "Running"
              )
              .map((game) => merge(game, { state: "Installed" })),
          })
        }
        const updatedGame = subscriptionData.data.gameState
        const newGames = merge({}, prev)
        const gameIndex = newGames.game.findIndex(
          (game) => game.playniteId === updatedGame.playniteId
        )
        newGames.game[gameIndex].state = updatedGame.state
        return newGames
      },
    })
  }, [])

  return (
    <>
      <AppBar position="static">
        <Tabs
          aria-label="Game Tabs"
          onChange={handleTabIndexChange}
          value={tabIndex}
        >
          <Tab label="Favorites"></Tab>
          <Tab label="All"></Tab>
          <Tab label="Actively Playing"></Tab>
        </Tabs>
      </AppBar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <h1>Filters</h1>
      </Drawer>
      <div
        style={{ height: "calc(100vh - 96px)", width: "calc(100vw - 35px)" }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <>
              <TabPanel value={tabIndex} index={0}>
                {loading ? (
                  <Loading />
                ) : (
                  <GameGrid
                    columnCount={4}
                    games={data?.game.filter((game) => game.favorite)}
                    height={height}
                    layout="horizontal"
                    rowCount={3}
                    width={width}
                  />
                )}
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                {loading ? (
                  <Loading />
                ) : (
                  <GameGrid
                    columnCount={5}
                    games={data?.game}
                    height={height}
                    layout="horizontal"
                    rowCount={4}
                    width={width}
                  />
                )}
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                {loading ? (
                  <Loading />
                ) : (
                  <GameGrid
                    columnCount={5}
                    games={data?.game.filter(
                      ({ state }) =>
                        state === "Launching" || state === "Running"
                    )}
                    height={height}
                    layout="horizontal"
                    rowCount={4}
                    width={width}
                  />
                )}
              </TabPanel>
            </>
          )}
        </AutoSizer>
      </div>
    </>
  )
}

export { App }
