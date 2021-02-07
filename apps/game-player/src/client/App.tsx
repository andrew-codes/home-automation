import * as React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { AppBar, Box, Drawer, makeStyles, Tab, Tabs } from "@material-ui/core"
import { gql, useQuery } from "@apollo/client"
import { GameGrid } from "./GameGrid"

const GET_GAMES = gql`
  query {
    game {
      id
      playniteId
      name
      releaseYear
      favorite
      hidden
      cover {
        id
        imageId
        height
      }
      platform {
        id
        name
      }
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

  const { loading, error, data } = useQuery(GET_GAMES)
  console.log(error)
  return (
    <>
      <AppBar position="static">
        <Tabs
          aria-label="Game Tabs"
          onChange={handleTabIndexChange}
          value={tabIndex}
        >
          <Tab label="Recent"></Tab>
          <Tab label="All"></Tab>
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
                    width={width}
                  />
                )}
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                {loading ? (
                  <Loading />
                ) : (
                  <GameGrid
                    columnCount={8}
                    games={data?.game}
                    height={height}
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
